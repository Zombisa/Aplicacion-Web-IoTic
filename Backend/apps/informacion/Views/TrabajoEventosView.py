from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.TrabajoEventos import TrabajoEventos
from apps.informacion.Serializers.TrabajoEventosSerializer import TrabajoEventosSerializer

class TrabajoEventosViewSet(viewsets.ModelViewSet):
    queryset = TrabajoEventos.objects.all()
    serializer_class = TrabajoEventosSerializer

    @action(detail=False, methods=['post'], url_path='agregar_trabajo_evento')
    def agregar_trabajo_evento(self, request):
        if verificarToken.validarRol(request) is True:
            serializer = TrabajoEventosSerializer(data=request.data)
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
        if verificarToken.validarRol(request) is True:
            trabajos_eventos = TrabajoEventos.objects.all()
            serializer = TrabajoEventosSerializer(trabajos_eventos, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)