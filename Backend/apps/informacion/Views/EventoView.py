from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.informacion.Models.Evento import Evento
from apps.informacion.Serializers.EventoSerializer import EventoSerializer
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken

class EventoViewSet(viewsets.ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer

    @action(detail=False, methods=['post'], url_path='publicar_evento')
    def publicar_evento(self, request):
        if verificarToken.validarRol(request) is True:
            serializer = EventoSerializer(data=request.data)
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
            return Response({'error': 'No autorizado. Solo los administradores o mentores realizar esta accion.'},
                            status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=['put'], url_path='editar_evento')
    def editar_evento(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                evento = Evento.objects.get(pk=pk)
            except Evento.DoesNotExist:
                return Response({'error': 'Evento no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            serializer = EventoSerializer(evento, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'No autorizado. Solo los administradores o mentores realizar esta accion.'},
                            status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=['delete'], url_path='eliminar_evento')
    def eliminar_evento(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                evento = Evento.objects.get(pk=pk)
            except Evento.DoesNotExist:
                return Response({'error': 'Evento no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            evento.delete()
            return Response({'Evento eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'No autorizado. Solo los administradores o mentores realizar esta accion.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=False, methods=['get'], url_path='listar_eventos')
    def listar_eventos(self, request):
        if verificarToken.validarRol(request) is True:
            eventos = Evento.objects.all()
            serializer = EventoSerializer(eventos, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'No autorizado. Solo los administradores o mentores realizar esta accion.'},
                            status=status.HTTP_403_FORBIDDEN)
