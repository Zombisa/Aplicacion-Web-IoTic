from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.Jurado import Jurado
from apps.informacion.Serializers.JuradoSerializer import JuradoSerializer
from django.conf import settings
import uuid
from backend.serviceCloudflare.R2Service import generar_url_firmada
from backend.serviceCloudflare.R2Client import s3

class JuradoViewSet(viewsets.ModelViewSet):
    """CRUD de jurados con rol requerido y manejo de imágenes en R2.

    Roles: valida rol en todas las acciones (403 si falla).
    Imágenes: `file_path` → `image_r2`; eliminar imagen borra en R2 y limpia el campo.
    Errores: 404 si no existe; 400 validación; 500 fallos R2.
    """

    queryset = Jurado.objects.all()
    serializer_class = JuradoSerializer

    @action(detail=False, methods=['post'], url_path='jurado')
    def agregar_jurado(self, request):
        """Crea un jurado.

        Entrada: datos del jurado; opcional `file_path` para `image_r2`.
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
            serializer = JuradoSerializer(data=data)
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
    
    @action(detail=True, methods=['put'], url_path='jurado')
    def editar_jurado(self, request, pk):
        """Edita parcialmente un jurado por `pk`; conserva usuario; 404/400 en errores."""
        if verificarToken.validarRol(request) is True:
            try:
                jurado = Jurado.objects.get(pk=pk)
            except Jurado.DoesNotExist:
                return Response({'error': 'Jurado no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            uid = verificarToken.obtenerUID(request)
            if jurado.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes editar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)
            
            serializer = JuradoSerializer(jurado, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    @action(detail=True, methods=['delete'], url_path='jurado')
    def eliminar_jurado(self, request, pk):
        """Elimina un jurado por `pk`; 404 si no existe."""
        if verificarToken.validarRol(request) is True:
            try:
                jurado = Jurado.objects.get(pk=pk)
            except Jurado.DoesNotExist:
                return Response({'error': 'Jurado no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            uid = verificarToken.obtenerUID(request)
            if jurado.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes eliminar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)
            
            #eliminar imagen en el bucket de clouflare
            # extraer solo el nombre de la imagen
            image_path = jurado.image_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=image_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar la imagen en R2: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            #eliminar archivo en el bucket de clouflare
            # extraer solo el nombre del archivo
            file_path = jurado.file_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_FILES_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar el archivo en R2: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            jurado.delete()
            return Response({'Jurado eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=False, methods=['get'], url_path='jurados')
    def listar_jurados(self, request):
        """Lista todos los jurados (requiere rol válido)."""
        if verificarToken.validarRol(request) is True:
            jurados = Jurado.objects.all()
            serializer = JuradoSerializer(jurados, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='imagen')
    def eliminar_imagen(self, request, pk):
        """Borra la imagen en R2 y limpia `image_r2` (400 sin imagen; 500 si R2 falla)."""
        if verificarToken.validarRol(request) is True:
            jurado = self.get_object()

            if not jurado.image_r2:
                return Response({"message": "El jurado no tiene imagen"}, status=status.HTTP_400_BAD_REQUEST)

            uid = verificarToken.obtenerUID(request)
            if jurado.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes eliminar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)
            
            # extraer solo el nombre del archivo
            file_path = jurado.image_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar la imagen en R2: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # actualizar campo image_r2 a None 
            jurado.image_r2 = None
            jurado.save()
            return Response({"message": "imagen eliminada correctamente"}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
        
    
    @action(detail=True, methods=['delete'], url_path='archivo')
    def eliminar_archivo(self, request, pk):
        if verificarToken.validarRol(request) is True:
            Jurado = self.get_object()

            if not Jurado.file_r2:
                return Response({"message": "Jurado no tiene archivo"}, status=status.HTTP_400_BAD_REQUEST)

            uid = verificarToken.obtenerUID(request)
            if Jurado.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes editar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)

            # extraer solo el nombre del archivo
            file_path = Jurado.file_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_FILES_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar el archivo en R2: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # actualizar producto 
            Jurado.file_r2 = None
            Jurado.save()
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
        
    @action(detail=False, methods=['get'], url_path='misJurados')
    def misJurados(self, request):
        """Lista los jurados que ha publicado el usuario (requiere rol válido)."""
        if verificarToken.validarRol(request) is True:
            jurados = Jurado.objects.all()
            juradosPublicados = []
            uid = verificarToken.obtenerUID(request)
            for jurado in jurados:
                if jurado.usuario.uid_firebase == uid:
                    juradosPublicados.append(jurado)
            if len(juradosPublicados) == 0:
                return Response({'message': 'No tienes jurados publicados'})
            serializer = JuradoSerializer(juradosPublicados, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)