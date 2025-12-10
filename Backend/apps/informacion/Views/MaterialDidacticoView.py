from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.MaterialDidactico import MaterialDidactico
from apps.informacion.Serializers.MaterialDidacticoSerializer import MaterialDidacticoSerializer
from django.conf import settings
import uuid
from backend.serviceCloudflare.R2Service import generar_url_firmada
from backend.serviceCloudflare.R2Client import s3

class MaterialDidacticoViewSet(viewsets.ModelViewSet):
    """CRUD de material didáctico con rol requerido y manejo de imágenes en R2.

    Roles: todas las acciones validan rol (403 si falla).
    Imágenes: `file_path` → `image_r2`; eliminar imagen borra en R2 y limpia el campo.
    Errores: 404 si no existe; 400 validación; 500 fallos R2.
    """

    queryset = MaterialDidactico.objects.all()
    serializer_class = MaterialDidacticoSerializer

    @action(detail=False, methods=['post'], url_path='material_did')
    def agregar_material_did(self, request):
        """Crea material didáctico.

        Entrada: datos del material; opcional `file_path` para `image_r2`.
        Salida: 201 creado; 404 si no se halla usuario; 400 si falla validación.
        """
        if verificarToken.validarRol(request) is True:
            data = request.data.copy()
            # construir la URL completa para la imagen
            image_path = data.pop("image_path", None)

            if image_path:
                # crear la URL usando tu dominio público del bucket
                full_url = f"{settings.R2_BUCKET_PATH}/{image_path}"
                data["image_r2"] = full_url
            
            # construir la url completa para el archivo
            archivo_path = data.pop("archivo_path", None)
            
            if archivo_path:
                full_url_archivo = f"{settings.R2_BUCKET_FILES_PATH}/{archivo_path}"
                data["file_r2"] = full_url_archivo
                
            serializer = MaterialDidacticoSerializer(data=data)
            if serializer.is_valid():
                user_uid = verificarToken.obtenerUID(request)
                try:
                    usuario = Usuario.objects.get(uid_firebase=user_uid)
                except:
                    return Response({'error': 'usuario no encontrado en la base de datos'}, status=status.HTTP_404_NOT_FOUND)
                serializer.save(usuario=usuario)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['put'], url_path='material_did')
    def editar_material_did(self, request, pk):
        """Edita parcialmente un material didáctico por `pk`; conserva usuario; 404/400 en errores."""
        if verificarToken.validarRol(request) is True:
            try:
                material_didactico = MaterialDidactico.objects.get(pk=pk)
            except MaterialDidactico.DoesNotExist:
                return Response({'error': 'Material didactico no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            uid = verificarToken.obtenerUID(request)
            if material_didactico.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes editar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)
#gestion para actualizar una imagen (se elimina y se sube otra en r2)
            data = request.data.copy()
            image_path = data.pop('image_path', None)
            if image_path and not data.get('image_r2'):
                data['image_r2'] = f"{settings.R2_BUCKET_PATH}/{image_path}"
            
            nueva_imagen = data.get('image_r2')
            if nueva_imagen and material_didactico.image_r2 and nueva_imagen != material_didactico.image_r2:
                imagen_anterior = material_didactico.image_r2
                filename = imagen_anterior.split("/")[-1]
                try:
                    s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=filename)
                except Exception as e:
                    # Log del error pero continuar con la actualización
                    print(f"Error eliminando imagen anterior de R2: {str(e)}")
            
            #gestion para actualizar un archivo (se elimina y se sube otro en r2)
            file_path = data.pop('archivo_path', None)
            if file_path and not data.get('file_r2'):
                data['file_r2'] = f"{settings.R2_BUCKET_PATH}/{file_path}"
                
            nuevo_archivo = data.get('file_r2')
            if nuevo_archivo and material_didactico.file_r2 and nuevo_archivo != material_didactico.file_r2:
                archivo_anterior = material_didactico.file_r2
                filename = archivo_anterior.split("/")[-1]
                try:
                    s3.delete_object(Bucket=settings.R2_BUCKET_FILES_NAME, Key=filename)
                except Exception as e:
                    print(f"Error eliminando archivo anterior de R2: {str(e)}")
            
            serializer = MaterialDidacticoSerializer(material_didactico, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
        
    @action(detail=True, methods=['delete'], url_path='material_did')
    def eliminar_material_did(self, request, pk):
        """Elimina un material didáctico por `pk`; 404 si no existe."""
        if verificarToken.validarRol(request) is True:
            try:
                material_didactico = MaterialDidactico.objects.get(pk=pk)
            except MaterialDidactico.DoesNotExist:
                return Response({'error': 'Material didactico no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            uid = verificarToken.obtenerUID(request)
            if material_didactico.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes eliminar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)

            #eliminar imagen en el bucket de clouflare
            # extraer solo el nombre de la imagen
            image_path = material_didactico.image_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=image_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar la imagen en R2: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            #eliminar archivo en el bucket de clouflare
            # extraer solo el nombre del archivo
            file_path = material_didactico.file_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_FILES_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar el archivo en R2: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            material_didactico.delete()
            return Response({'Material didactico eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=False, methods=['get'], url_path='materiales_did')
    def listar_materiales_did(self, request):
        """Lista todos los materiales didácticos (requiere rol válido)."""
        if verificarToken.validarRol(request) is True:
            materiales_didacticos = MaterialDidactico.objects.all()
            serializer = MaterialDidacticoSerializer(materiales_didacticos, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='imagen')
    def eliminar_imagen(self, request, pk):
        """Borra la imagen en R2 y limpia `image_r2` (400 sin imagen; 500 si R2 falla)."""
        if verificarToken.validarRol(request) is True:
            MaterialDidactico = self.get_object()

            if not MaterialDidactico.image_r2:
                return Response({"message": "El MaterialDidactico no tiene imagen"}, status=status.HTTP_400_BAD_REQUEST)

            uid = verificarToken.obtenerUID(request)
            if MaterialDidactico.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes eliminar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)

            # extraer solo el nombre del archivo
            file_path = MaterialDidactico.image_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar la imagen en R2: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # actualizar campo image_r2 a None 
            MaterialDidactico.image_r2 = None
            MaterialDidactico.save()
            return Response({"message": "imagen eliminada correctamente"}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
       
    
    @action(detail=True, methods=['delete'], url_path='archivo')
    def eliminar_archivo(self, request, pk):
        if verificarToken.validarRol(request) is True:
            MaterialDidactico = self.get_object()

            if not MaterialDidactico.file_r2:
                return Response({"message": "Material didactico no tiene archivo"}, status=status.HTTP_400_BAD_REQUEST)

            uid = verificarToken.obtenerUID(request)
            if MaterialDidactico.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes eliminar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)

            # extraer solo el nombre del archivo
            file_path = MaterialDidactico.file_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_FILES_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar el archivo en R2: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # actualizar producto 
            MaterialDidactico.file_r2 = None
            MaterialDidactico.save()
            return Response({"message": "Archivo eliminado correctamente"}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
        
    
    @action(detail=False, methods=['get'], url_path='imagenes')
    def listar_imagenes(self, request):
        """Devuelve las URLs públicas actuales del bucket R2."""
        try:
            response = s3.list_objects_v2(Bucket=settings.R2_BUCKET_NAME)
            archivos = [obj['Key'] for obj in response.get('Contents', [])]
            # Construir URLs públicas
            urls = [f"{settings.R2_BUCKET_PATH}/{key}" for key in archivos]
            return Response(urls)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    @action(detail=False, methods=['get'], url_path='misMaterialesDidacticos')
    def misMaterialesDidacticos(self, request):
        """Lista los materiales didacticos que ha publicado el usuario (requiere rol válido)."""
        if verificarToken.validarRol(request) is True:
            mds = MaterialDidactico.objects.all()
            mdsPublicados = []
            uid = verificarToken.obtenerUID(request)
            for md in mds:
                if md.usuario.uid_firebase == uid:
                    mdsPublicados.append(md)
            if len(mdsPublicados) == 0:
                return Response({'message': 'No tienes materiales didacticos publicados'})
            serializer = MaterialDidacticoSerializer(mdsPublicados, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)