from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.TutoriaEnMarcha import TutoriaEnMarcha
from apps.informacion.Serializers.TutoriaEnMarchaSerializer import TutoriaEnMarchaSerializer
from django.conf import settings
import uuid
from backend.serviceCloudflare.R2Service import generar_url_firmada
from backend.serviceCloudflare.R2Client import s3

class TutoriaEnMarchaViewSet(viewsets.ModelViewSet):
    """CRUD de tutorías en marcha con rol obligatorio y gestión de imágenes en R2.

    Roles: valida token en todas las acciones (403 si falla).
    Imágenes: `file_path` → `image_r2` con `R2_BUCKET_PATH` antes de validar/guardar; eliminar imagen borra en R2 y limpia el campo.
    Errores: 404 si la tutoría no existe; 400 validación; 500 fallos R2.
    """

    queryset = TutoriaEnMarcha.objects.all()
    serializer_class = TutoriaEnMarchaSerializer

    @action(detail=False, methods=['post'], url_path='tutoria_en_marcha')
    def agregar_tutoria_en_marcha(self, request):
        """Crea una tutoría en marcha.

        Entrada: datos de la tutoría; opcional `file_path` para poblar `image_r2`.
        Salida: 201 con tutoría creada y usuario autenticado; 404 si no se encuentra el usuario; 400 si la validación falla; 403 si el rol es inválido.
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
            serializer = TutoriaEnMarchaSerializer(data=data)
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
    
    @action(detail=True, methods=['put'], url_path='tutoria_en_marcha')
    def editar_tutoria_en_marcha(self, request, pk):
        """Edita parcialmente una tutoría en marcha por `pk`, preservando el usuario original; 404 si no existe, 400 si falla validación, 403 si el rol es inválido."""
        if verificarToken.validarRol(request) is True:
            try:
                tutoria_en_marcha = TutoriaEnMarcha.objects.get(pk=pk)
            except TutoriaEnMarcha.DoesNotExist:
                return Response({'error': 'Tutoría en marcha no encontrada'}, status=status.HTTP_404_NOT_FOUND)

            uid = verificarToken.obtenerUID(request)
            if tutoria_en_marcha.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes editar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)
            
            #gestion para actualizar una imagen (se elimina y se sube otra en r2)
            data = request.data.copy()
            image_path = data.pop('image_path', None)
            if image_path and not data.get('image_r2'):
                data['image_r2'] = f"{settings.R2_BUCKET_PATH}/{image_path}"
            
            nueva_imagen = data.get('image_r2')
            if nueva_imagen and tutoria_en_marcha.image_r2 and nueva_imagen != tutoria_en_marcha.image_r2:
                imagen_anterior = tutoria_en_marcha.image_r2
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
            if nuevo_archivo and tutoria_en_marcha.file_r2 and nuevo_archivo != tutoria_en_marcha.file_r2:
                archivo_anterior = tutoria_en_marcha.file_r2
                filename = archivo_anterior.split("/")[-1]
                try:
                    s3.delete_object(Bucket=settings.R2_BUCKET_FILES_NAME, Key=filename)
                except Exception as e:
                    print(f"Error eliminando archivo anterior de R2: {str(e)}")
            
            serializer = TutoriaEnMarchaSerializer(tutoria_en_marcha, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='tutoria_en_marcha')
    def eliminar_tutoria_en_marcha(self, request, pk):
        """Elimina una tutoría en marcha por `pk`; 404 si no existe; 403 si el rol es inválido."""
        if verificarToken.validarRol(request) is True:
            try:
                tutoria_en_marcha = TutoriaEnMarcha.objects.get(pk=pk)
            except TutoriaEnMarcha.DoesNotExist:
                return Response({'error': 'Tutoría en marcha no encontrada'}, status=status.HTTP_404_NOT_FOUND)

            uid = verificarToken.obtenerUID(request)
            if tutoria_en_marcha.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes eliminar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)
            
            #eliminar imagen en el bucket de clouflare
            # extraer solo el nombre de la imagen
            image_path = tutoria_en_marcha.image_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=image_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar la imagen en R2: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            #eliminar archivo en el bucket de clouflare
            # extraer solo el nombre del archivo
            file_path = tutoria_en_marcha.file_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_FILES_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar el archivo en R2: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            tutoria_en_marcha.delete()
            return Response({'Tutoría en marcha eliminada correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
        
    @action(detail=False, methods=['get'], url_path='tutorias_en_marcha')
    def listar_tutorias_en_marcha(self, request):
        """Lista todas las tutorías en marcha (requiere rol válido, 403 en caso contrario)."""
        if verificarToken.validarRol(request) is True:
            tutorias_en_marcha = TutoriaEnMarcha.objects.all()
            serializer = TutoriaEnMarchaSerializer(tutorias_en_marcha, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='imagen')
    def eliminar_imagen(self, request, pk):
        """Borra la imagen en R2 y limpia `image_r2` (400 sin imagen; 500 si R2 falla)."""
        if verificarToken.validarRol(request) is True:
            TutoriaEnMarcha = self.get_object()

            if not TutoriaEnMarcha.image_r2:
                return Response({"message": "La tutoria en marcha no tiene imagen"}, status=status.HTTP_400_BAD_REQUEST)

            uid = verificarToken.obtenerUID(request)
            if TutoriaEnMarcha.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes eliminar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)

            # extraer solo el nombre del archivo
            file_path = TutoriaEnMarcha.image_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar la imagen en R2: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # actualizar campo image_r2 a None 
            TutoriaEnMarcha.image_r2 = None
            TutoriaEnMarcha.save()
            return Response({"message": "imagen eliminada correctamente"}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
        
    
    @action(detail=True, methods=['delete'], url_path='archivo')
    def eliminar_archivo(self, request, pk):
        if verificarToken.validarRol(request) is True:
            TutoriaEnMarcha = self.get_object()

            if not TutoriaEnMarcha.file_r2:
                return Response({"message": "Tutoria en marcha no tiene archivo"}, status=status.HTTP_400_BAD_REQUEST)

            uid = verificarToken.obtenerUID(request)
            if TutoriaEnMarcha.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes eliminar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)

            # extraer solo el nombre del archivo
            file_path = TutoriaEnMarcha.file_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_FILES_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar el archivo en R2: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # actualizar producto 
            TutoriaEnMarcha.file_r2 = None
            TutoriaEnMarcha.save()
            return Response({"message": "Archivo eliminado correctamente"}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
        
    
    @action(detail=False, methods=['get'], url_path='imagenes')
    def listar_imagenes(self, request):
        """Devuelve las URLs públicas actuales del bucket R2 configurado."""
        try:
            response = s3.list_objects_v2(Bucket=settings.R2_BUCKET_NAME)
            archivos = [obj['Key'] for obj in response.get('Contents', [])]
            # Construir URLs públicas
            urls = [f"{settings.R2_BUCKET_PATH}/{key}" for key in archivos]
            return Response(urls)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], url_path='miTutoriasMar')
    def miTutoriasMar(self, request):
        """Lista las tutorias en marcha que ha publicado el usuario (requiere rol válido)."""
        if verificarToken.validarRol(request) is True:
            tms = TutoriaEnMarcha.objects.all()
            tmsPublicados = []
            uid = verificarToken.obtenerUID(request)
            for tm in tms:
                if tm.usuario.uid_firebase == uid:
                    tmsPublicados.append(tm)
            if len(tmsPublicados) == 0:
                return Response({'message': 'No tienes tutorias en marcha publicados'})
            serializer = TutoriaEnMarchaSerializer(tmsPublicados, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)