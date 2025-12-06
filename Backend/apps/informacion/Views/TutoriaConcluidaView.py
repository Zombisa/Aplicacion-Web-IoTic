from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.TutoriaConcluida import TutoriaConcluida
from apps.informacion.Serializers.TutoriaConcluidaSerializer import TutoriaConcluidaSerializer
from django.conf import settings
import uuid
from backend.serviceCloudflare.R2Service import generar_url_firmada
from backend.serviceCloudflare.R2Client import s3

class TutoriaConcluidaViewSet(viewsets.ModelViewSet):
    """CRUD de tutorías concluidas con rol obligatorio y gestión de imágenes en R2.

    Roles: valida token en todas las acciones (403 si falla).
    Imágenes: `file_path` → `image_r2` con `R2_BUCKET_PATH` antes de validar/guardar; eliminar imagen borra en R2 y limpia el campo.
    Errores: 404 si la tutoría no existe; 400 validación; 500 fallos R2.
    """

    queryset = TutoriaConcluida.objects.all()
    serializer_class = TutoriaConcluidaSerializer

    @action(detail=False, methods=['post'], url_path='agregar_tutoria_concluida')
    def agregar_tutoria_concluida(self, request):
        """Crea una tutoría concluida.

        Entrada: datos de la tutoría; opcional `file_path` para poblar `image_r2`.
        Salida: 201 con tutoría creada y usuario autenticado; 404 si no se encuentra el usuario; 400 si la validación falla; 403 si el rol es inválido.
        """
        if verificarToken.validarRol(request) is True:
            data = request.data.copy()
            # si existe file_path, construir la URL completa
            file_path = data.pop("file_path", None)

            if file_path:
                # crear la URL usando tu dominio público del bucket
                full_url = f"{settings.R2_BUCKET_PATH}/{file_path}"
                data["image_r2"] = full_url
            serializer = TutoriaConcluidaSerializer(data=data)
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
    
    @action(detail=True, methods=['put'], url_path='editar_tutoria_concluida')
    def editar_tutoria_concluida(self, request, pk):
        """Edita parcialmente una tutoría concluida por `pk`, preservando el usuario original; 404 si no existe, 400 si falla validación, 403 si el rol es inválido."""
        if verificarToken.validarRol(request) is True:
            try:
                tutoria_concluida = TutoriaConcluida.objects.get(pk=pk)
            except TutoriaConcluida.DoesNotExist:
                return Response({'error': 'Tutoría concluida no encontrada'}, status=status.HTTP_404_NOT_FOUND)

            serializer = TutoriaConcluidaSerializer(tutoria_concluida, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='eliminar_tutoria_concluida')
    def eliminar_tutoria_concluida(self, request, pk):
        """Elimina una tutoría concluida por `pk`; 404 si no existe; 403 si el rol es inválido."""
        if verificarToken.validarRol(request) is True:
            try:
                tutoria_concluida = TutoriaConcluida.objects.get(pk=pk)
            except TutoriaConcluida.DoesNotExist:
                return Response({'error': 'Tutoría concluida no encontrada'}, status=status.HTTP_404_NOT_FOUND)

            tutoria_concluida.delete()
            return Response({'Tutoría concluida eliminada correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=False, methods=['get'], url_path='listar_tutorias_concluidas')
    def listar_tutorias_concluidas(self, request):
        """Lista todas las tutorías concluidas (requiere rol válido, 403 en caso contrario)."""
        if verificarToken.validarRol(request) is True:
            tutorias_concluidas = TutoriaConcluida.objects.all()
            serializer = TutoriaConcluidaSerializer(tutorias_concluidas, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='eliminar-imagen')
    def eliminar_imagen(self, request, pk):
        """Borra la imagen en R2 y limpia `image_r2` (400 sin imagen; 500 si R2 falla)."""
        TutoriaConcluida = self.get_object()

        if not TutoriaConcluida.image_r2:
            return Response({"message": "La tutoria concluida no tiene imagen"}, status=status.HTTP_400_BAD_REQUEST)

        # extraer solo el nombre del archivo
        file_path = TutoriaConcluida.image_r2.split("/")[-1]

        try:
            s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=file_path)
        except Exception as e:
            return Response({"error": f"No se pudo eliminar la imagen en R2: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # actualizar campo image_r2 a None 
        TutoriaConcluida.image_r2 = None
        TutoriaConcluida.save()
        return Response({"message": "imagen eliminada correctamente"}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='listar-imagenes')
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