from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.ProcesoTecnica import ProcesoTecnica
from apps.informacion.Serializers.ProcesoTecnicaSerializer import ProcesoTecnicaSerializer

class ProcesoTecnicaViewSet(viewsets.ModelViewSet):
    queryset = ProcesoTecnica.objects.all()
    serializer_class = ProcesoTecnicaSerializer

    @action(detail=False, methods=['post'], url_path='agregar_proceso_tecnica')
    def agregar_proceso_tecnica(self, request):
        if verificarToken.validarRol(request) is True:
            serializer = ProcesoTecnicaSerializer(data=request.data)
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
    @action(detail=True, methods=['put'], url_path='editar_proceso_tecnica')
    def editar_proceso_tecnica(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                proceso_tecnica = ProcesoTecnica.objects.get(pk=pk)
            except ProcesoTecnica.DoesNotExist:
                return Response({'error': 'Proceso técnico no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            serializer = ProcesoTecnicaSerializer(proceso_tecnica, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
           return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
           
    @action(detail=True, methods=['delete'], url_path='eliminar_proceso_tecnica')
    def eliminar_proceso_tecnica(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                proceso_tecnica = ProcesoTecnica.objects.get(pk=pk)
            except ProcesoTecnica.DoesNotExist:
                return Response({'error': 'Proceso técnico no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            proceso_tecnica.delete()
            return Response({'Proceso técnico eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
            
    @action(detail=False, methods=['get'], url_path='listar_procesos_tecnicas')
    def listar_procesos_tecnicas(self, request):
        if  verificarToken.validarRol(request) is True:
            procesos_tecnicas = ProcesoTecnica.objects.all()
            serializer = ProcesoTecnicaSerializer(procesos_tecnicas, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)