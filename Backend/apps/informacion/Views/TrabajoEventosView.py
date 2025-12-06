from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.TrabajoEventos import TrabajoEventos
from apps.informacion.Serializers.TrabajoEventosSerializer import TrabajoEventosSerializer
from django.conf import settings
import uuid
from backend.serviceCloudflare.R2Service import generar_url_firmada
from backend.serviceCloudflare.R2Client import s3

class TrabajoEventosViewSet(viewsets.ModelViewSet):
    """CRUD de trabajos en eventos con rol requerido y manejo de imágenes en R2.

    Roles: valida rol en todas las acciones (403 si falla).
    Imágenes: `file_path` → `image_r2`; eliminar imagen borra en R2 y limpia el campo.
    Errores: 404 si no existe; 400 validación; 500 fallos R2.
    """

    queryset = TrabajoEventos.objects.all()
    serializer_class = TrabajoEventosSerializer

    @action(detail=False, methods=['post'], url_path='agregar_trabajo_evento')
    def agregar_trabajo_evento(self, request):
        """Crea un trabajo en evento.

        Entrada: datos del trabajo; opcional `file_path` para `image_r2`.
        Salida: 201 creado; 404 si no se halla usuario; 400 si falla validación.
        """
        if verificarToken.validarRol(request) is True:
            data = request.data.copy()
            # si existe file_path, construir la URL completa
            file_path = data.pop("file_path", None)

            if file_path:
                # crear la URL usando tu dominio público del bucket
                full_url = f"{settings.R2_BUCKET_PATH}/{file_path}"
                data["image_r2"] = full_url
            serializer = TrabajoEventosSerializer(data=data)
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
    
    @action(detail=True, methods=['put'], url_path='editar_trabajo_evento')
    def editar_trabajo_evento(self, request, pk):
        """Edita parcialmente un trabajo en evento por `pk`; conserva usuario; 404/400 en errores."""
        if verificarToken.validarRol(request) is True:
            try:
                trabajo_evento = TrabajoEventos.objects.get(pk=pk)
            except TrabajoEventos.DoesNotExist:
                return Response({'error': 'Trabajo en evento no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            serializer = TrabajoEventosSerializer(trabajo_evento, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='eliminar_trabajo_evento')
    def eliminar_trabajo_evento(self, request, pk):
        """Elimina un trabajo en evento por `pk`; 404 si no existe."""
        if verificarToken.validarRol(request) is True:
            try:
                trabajo_evento = TrabajoEventos.objects.get(pk=pk)
            except TrabajoEventos.DoesNotExist:
                return Response({'error': 'Trabajo en evento no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            trabajo_evento.delete()
            return Response({'Trabajo en evento eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=False, methods=['get'], url_path='listar_trabajos_eventos')
    def listar_trabajos_eventos(self, request):
        """Lista todos los trabajos en eventos (requiere rol válido)."""
        if verificarToken.validarRol(request) is True:
            trabajos_eventos = TrabajoEventos.objects.all()
            serializer = TrabajoEventosSerializer(trabajos_eventos, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='eliminar-imagen')
    def eliminar_imagen(self, request, pk):
        """Borra la imagen en R2 y limpia `image_r2` (400 sin imagen; 500 si R2 falla)."""
        TrabajoEventos = self.get_object()

        if not TrabajoEventos.image_r2:
            return Response({"message": "El trabajo en eventos no tiene imagen"}, status=status.HTTP_400_BAD_REQUEST)

        # extraer solo el nombre del archivo
        file_path = TrabajoEventos.image_r2.split("/")[-1]

        try:
            s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=file_path)
        except Exception as e:
            return Response({"error": f"No se pudo eliminar la imagen en R2: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # actualizar campo image_r2 a None 
        TrabajoEventos.image_r2 = None
        TrabajoEventos.save()
        return Response({"message": "imagen eliminada correctamente"}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='listar-imagenes')
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