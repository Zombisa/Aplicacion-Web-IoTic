from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.ProcesoTecnica import ProcesoTecnica
from apps.informacion.Serializers.ProcesoTecnicaSerializer import ProcesoTecnicaSerializer
from django.conf import settings
import uuid
from backend.serviceCloudflare.R2Service import generar_url_firmada
from backend.serviceCloudflare.R2Client import s3

class ProcesoTecnicaViewSet(viewsets.ModelViewSet):
    """CRUD de procesos/técnicas con rol requerido y manejo de imágenes en R2.

    Roles: valida rol en todas las acciones (403 si falla).
    Imágenes: `file_path` → `image_r2`; eliminar imagen borra en R2 y limpia el campo.
    Errores: 404 si no existe; 400 validación; 500 fallos R2.
    """

    queryset = ProcesoTecnica.objects.all()
    serializer_class = ProcesoTecnicaSerializer

    @action(detail=False, methods=['post'], url_path='proceso_tecnica')
    def agregar_proceso_tecnica(self, request):
        """Crea un proceso/técnica.

        Entrada: datos del proceso; opcional `file_path` para `image_r2`.
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
            serializer = ProcesoTecnicaSerializer(data=data)
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
    @action(detail=True, methods=['put'], url_path='proceso_tecnica')
    def editar_proceso_tecnica(self, request, pk):
        """Edita parcialmente un proceso/técnica por `pk`; conserva usuario; 404/400 en errores."""
        if verificarToken.validarRol(request) is True:
            try:
                proceso_tecnica = ProcesoTecnica.objects.get(pk=pk)
            except ProcesoTecnica.DoesNotExist:
                return Response({'error': 'Proceso técnico no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            uid = verificarToken.obtenerUID(request)
            if proceso_tecnica.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes editar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)

#gestion para actualizar una imagen (se elimina y se sube otra en r2)
            data = request.data.copy()
            image_path = data.pop('image_path', None)
            if image_path and not data.get('image_r2'):
                data['image_r2'] = f"{settings.R2_BUCKET_PATH}/{image_path}"
            
            nueva_imagen = data.get('image_r2')
            if nueva_imagen and proceso_tecnica.image_r2 and nueva_imagen != proceso_tecnica.image_r2:
                imagen_anterior = proceso_tecnica.image_r2
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
            if nuevo_archivo and proceso_tecnica.file_r2 and nuevo_archivo != proceso_tecnica.file_r2:
                archivo_anterior = proceso_tecnica.file_r2
                filename = archivo_anterior.split("/")[-1]
                try:
                    s3.delete_object(Bucket=settings.R2_BUCKET_FILES_NAME, Key=filename)
                except Exception as e:
                    print(f"Error eliminando archivo anterior de R2: {str(e)}")
            
            serializer = ProcesoTecnicaSerializer(proceso_tecnica, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
           return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
           
    @action(detail=True, methods=['delete'], url_path='Proceso_tecnica')
    def eliminar_proceso_tecnica(self, request, pk):
        """Elimina un proceso/técnica por `pk`; 404 si no existe."""
        if verificarToken.validarRol(request) is True:
            try:
                proceso_tecnica = ProcesoTecnica.objects.get(pk=pk)
            except ProcesoTecnica.DoesNotExist:
                return Response({'error': 'Proceso técnico no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            uid = verificarToken.obtenerUID(request)
            if proceso_tecnica.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes eliminar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)

            #eliminar imagen en el bucket de clouflare
            # extraer solo el nombre de la imagen
            image_path = proceso_tecnica.image_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=image_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar la imagen en R2: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            #eliminar archivo en el bucket de clouflare
            # extraer solo el nombre del archivo
            file_path = proceso_tecnica.file_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_FILES_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar el archivo en R2: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            proceso_tecnica.delete()
            return Response({'Proceso técnico eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
            
    @action(detail=False, methods=['get'], url_path='procesos_tecnicas')
    def listar_procesos_tecnicas(self, request):
        """Lista todos los procesos/técnicas (requiere rol válido)."""
        if  verificarToken.validarRol(request) is True:
            procesos_tecnicas = ProcesoTecnica.objects.all()
            serializer = ProcesoTecnicaSerializer(procesos_tecnicas, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='imagen')
    def eliminar_imagen(self, request, pk):
        """Borra la imagen en R2 y limpia `image_r2` (400 sin imagen; 500 si R2 falla)."""
        if verificarToken.validarRol(request) is True:
            ProcesoTecnica = self.get_object()

            if not ProcesoTecnica.image_r2:
                return Response({"message": "El proceso/tecnica no tiene imagen"}, status=status.HTTP_400_BAD_REQUEST)

            uid = verificarToken.obtenerUID(request)
            if ProcesoTecnica.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes eliminar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)


            # extraer solo el nombre del archivo
            file_path = ProcesoTecnica.image_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar la imagen en R2: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # actualizar campo image_r2 a None 
            ProcesoTecnica.image_r2 = None
            ProcesoTecnica.save()
            return Response({"message": "imagen eliminada correctamente"}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
        
    
    @action(detail=True, methods=['delete'], url_path='archivo')
    def eliminar_archivo(self, request, pk):
        if verificarToken.validarRol(request) is True:
            ProcesoTecnica = self.get_object()

            if not ProcesoTecnica.file_r2:
                return Response({"message": "El proceso/tecnica no tiene archivo"}, status=status.HTTP_400_BAD_REQUEST)

            uid = verificarToken.obtenerUID(request)
            if ProcesoTecnica.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes eliminar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)

            # extraer solo el nombre del archivo
            file_path = ProcesoTecnica.file_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_FILES_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar el archivo en R2: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # actualizar producto 
            ProcesoTecnica.file_r2 = None
            ProcesoTecnica.save()
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
    
    @action(detail=False, methods=['get'], url_path='misProcesosTenicas')
    def misProcesosTenicas(self, request):
        """Lista los procesos/Tenicas que ha publicado el usuario (requiere rol válido)."""
        if verificarToken.validarRol(request) is True:
            pts = ProcesoTecnica.objects.all()
            ptsPublicados = []
            uid = verificarToken.obtenerUID(request)
            for pt in pts:
                if pt.usuario.uid_firebase == uid:
                    ptsPublicados.append(pt)
            if len(ptsPublicados) == 0:
                return Response({'message': 'No tienes procesos/tecnicas publicados'})
            serializer = ProcesoTecnicaSerializer(ptsPublicados, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
        
        
    @action(detail=True, methods=['get'], url_path='pro')
    def getProcesoTecnicaById(self, request, pk):
        """Obtiene un proceso/tecnica por ID (requiere rol válido)."""

        if verificarToken.validarRol(request) is True:
            try:
                pro = ProcesoTecnica.objects.get(pk=pk)
            except ProcesoTecnica.DoesNotExist:
                return Response({'error': 'proceso/tecnica no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            serializer = ProcesoTecnicaSerializer(pro)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)