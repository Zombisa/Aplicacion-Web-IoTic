from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.Jurado import Jurado
from apps.informacion.Serializers.JuradoSerializer import JuradoSerializer

class JuradoViewSet(viewsets.ModelViewSet):
    queryset = Jurado.objects.all()
    serializer_class = JuradoSerializer

    @action(detail=False, methods=['post'], url_path='agregar_jurado')
    def agregar_jurado(self, request):
        if verificarToken.validarRol(request) is True:
            serializer = JuradoSerializer(data=request.data)
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
    
    @action(detail=True, methods=['put'], url_path='editar_jurado')
    def editar_jurado(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                jurado = Jurado.objects.get(pk=pk)
            except Jurado.DoesNotExist:
                return Response({'error': 'Jurado no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            serializer = JuradoSerializer(jurado, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    @action(detail=True, methods=['delete'], url_path='eliminar_jurado')
    def eliminar_jurado(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                jurado = Jurado.objects.get(pk=pk)
            except Jurado.DoesNotExist:
                return Response({'error': 'Jurado no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            jurado.delete()
            return Response({'Jurado eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=False, methods=['get'], url_path='listar_jurados')
    def listar_jurados(self, request):
        if verificarToken.validarRol(request) is True:
            jurados = Jurado.objects.all()
            serializer = JuradoSerializer(jurados, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)