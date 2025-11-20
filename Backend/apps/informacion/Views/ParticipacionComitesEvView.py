from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.ParticipacionComitesEv import ParticipacionComitesEv
from apps.informacion.Serializers.ParticipacionComitesEvSerializer import ParticipacionComitesEvSerializer

class ParticipacionComitesEvViewSet(viewsets.ModelViewSet):
    queryset = ParticipacionComitesEv.objects.all()
    serializer_class = ParticipacionComitesEvSerializer

    @action(detail=False, methods=['post'], url_path='agregar_comite_ev')
    def agregar_comite_ev(self, request):
        if verificarToken.validarRol(request) is True:
            serializer = ParticipacionComitesEvSerializer(data=request.data)
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
    
    @action(detail=True, methods=['put'], url_path='editar_comite_ev')
    def editar_comite_ev(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                comite_ev = ParticipacionComitesEv.objects.get(pk=pk)
            except ParticipacionComitesEv.DoesNotExist:
                return Response({'error': 'Participacion en comite o evento no encontrada'}, status=status.HTTP_404_NOT_FOUND)

            serializer = ParticipacionComitesEvSerializer(comite_ev, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='eliminar_comite_ev')
    def eliminar_comite_ev(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                comite_ev = ParticipacionComitesEv.objects.get(pk=pk)
            except ParticipacionComitesEv.DoesNotExist:
                return Response({'error': 'Participacion en comite o evento no encontrada'}, status=status.HTTP_404_NOT_FOUND)

            comite_ev.delete()
            return Response({'Participacion en comite o evento eliminada correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=False, methods=['get'], url_path='listar_comites_ev')
    def listar_comites_ev(self, request):
        if verificarToken.validarRol(request) is True:
            comites_ev = ParticipacionComitesEv.objects.all()
            serializer = ParticipacionComitesEvSerializer(comites_ev, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)