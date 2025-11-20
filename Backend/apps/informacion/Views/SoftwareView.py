from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.Software import Software
from apps.informacion.Serializers.SoftwareSerializer import SoftwareSerializer

class SoftwareViewSet(viewsets.ModelViewSet):
    queryset = Software.objects.all()
    serializer_class = SoftwareSerializer

    @action(detail=False, methods=['post'], url_path='agregar_software')
    def agregar_software(self, request):
        if verificarToken.validarRol(request) is True:
            serializer = SoftwareSerializer(data=request.data)
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
     
    @action(detail=True, methods=['put'], url_path='editar_software')
    def editar_software(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                software = Software.objects.get(pk=pk)
            except Software.DoesNotExist:
                return Response({'error': 'Software no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            serializer = SoftwareSerializer(software, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='eliminar_software')
    def eliminar_software(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                software = Software.objects.get(pk=pk)
            except Software.DoesNotExist:
                return Response({'error': 'Software no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            software.delete()
            return Response({'Software eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=False, methods=['get'], url_path='listar_software')
    def listar_software(self, request):
        if verificarToken.validarRol(request) is True:
            software_queryset = Software.objects.all()
            serializer = SoftwareSerializer(software_queryset, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)