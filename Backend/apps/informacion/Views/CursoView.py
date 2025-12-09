from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.informacion.Models.Curso import Curso
from apps.informacion.Serializers.CursoSerializer import CursoSerializer
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from django.conf import settings
import uuid
from backend.serviceCloudflare.R2Service import generar_url_firmada
from backend.serviceCloudflare.R2Client import s3

class CursoViewSet(viewsets.ModelViewSet):
    """CRUD de cursos con rol requerido y soporte de imágenes en R2.

    Roles: todas las acciones exigen `verificarToken.validarRol` (403 si falla).
    Imágenes: `file_path` → `image_r2` usando `R2_BUCKET_PATH`; eliminar imagen borra en R2 y limpia el campo.
    Errores: 404 si no existe el curso; 400 validación; 500 fallos R2.
    """

    queryset = Curso.objects.all()
    serializer_class = CursoSerializer

    @action(detail=False, methods=['post'], url_path='curso')
    def agregar_curso(self, request):
        """Crea un curso.

        Entrada: datos del curso; opcional `file_path` para `image_r2`.
        Salida: 201 con el curso creado; 404 si no se halla el usuario; 400 si falla validación.
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

            serializer = CursoSerializer(data=data)
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

    @action(detail=True, methods=['put'], url_path='curso')
    def editar_curso(self, request, pk):
        """Actualiza parcialmente un curso por `pk`; mantiene el usuario original. Errores: 404/400."""
        if verificarToken.validarRol(request) is True:
            try:
                curso = Curso.objects.get(pk=pk)
            except Curso.DoesNotExist:
                return Response({'error': 'Curso no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
            uid = verificarToken.obtenerUID(request)
            if curso.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes editar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)
            

            serializer = CursoSerializer(curso, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=['delete'], url_path='curso')
    def eliminar_curso(self, request, pk):
        """Elimina un curso por `pk`; 404 si no existe."""
        if verificarToken.validarRol(request) is True:
            try:
                curso = Curso.objects.get(pk=pk)
            except Curso.DoesNotExist:
                return Response({'error': 'Curso no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
            uid = verificarToken.obtenerUID(request)
            if curso.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes eliminar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)
            
            #eliminar imagen en el bucket de clouflare
            # extraer solo el nombre de la imagen
            image_path = curso.image_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=image_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar la imagen en R2: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            #eliminar archivo en el bucket de clouflare
            # extraer solo el nombre del archivo
            file_path = curso.file_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_FILES_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar el archivo en R2: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
            curso.delete()
            return Response({'Curso eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
           return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=False, methods=['get'], url_path='cursos')
    def listar_cursos(self, request):
        """Lista todos los cursos (requiere rol válido)."""
        if verificarToken.validarRol(request) is True:
            cursos = Curso.objects.all()
            serializer = CursoSerializer(cursos, many=True)
            return Response(serializer.data)
        else:
           return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='imagen')
    def eliminar_imagen(self, request, pk):
        """Borra la imagen del curso en R2 y limpia `image_r2` (400 sin imagen; 500 si falla R2)."""
        if verificarToken.validarRol(request) is True:
            curso = self.get_object()

            if not curso.image_r2:
                return Response({"message": "El curso no tiene imagen"}, status=status.HTTP_400_BAD_REQUEST)

            uid = verificarToken.obtenerUID(request)
            if Curso.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes eliminar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)
            
            
            # extraer solo el nombre del archivo
            file_path = curso.image_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar la imagen en R2: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # actualizar campo image_r2 a None 
            curso.image_r2 = None
            curso.save()
            return Response({"message": "imagen eliminada correctamente"}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
        
    
    @action(detail=True, methods=['delete'], url_path='archivo')
    def eliminar_archivo(self, request, pk):
        if verificarToken.validarRol(request) is True:
            Curso = self.get_object()

            if not Curso.file_r2:
                return Response({"message": "Curso no tiene archivo"}, status=status.HTTP_400_BAD_REQUEST)

            uid = verificarToken.obtenerUID(request)
            if Curso.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes eliminar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)
            
            # extraer solo el nombre del archivo
            file_path = Curso.file_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_FILES_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar el archivo en R2: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # actualizar producto 
            Curso.file_r2 = None
            Curso.save()
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

    @action(detail=False, methods=['get'], url_path='misCursos')
    def misCursos(self, request):
        """Lista los cursos que ha publicado el usuario (requiere rol válido)."""
        if verificarToken.validarRol(request) is True:
            cursos = Curso.objects.all()
            cursosPublicados = []
            uid = verificarToken.obtenerUID(request)
            for curso in cursos:
                if curso.usuario.uid_firebase == uid:
                    cursosPublicados.append(curso)
            if len(cursosPublicados) == 0:
                return Response({'message': 'No tienes cursos publicados'})
            serializer = CursoSerializer(cursosPublicados, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)