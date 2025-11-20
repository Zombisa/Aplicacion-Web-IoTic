from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.Revista import Revista
from apps.informacion.Serializers.RevistaSerializer import RevistaSerializer

class RevistaViewSet(viewsets.ModelViewSet):
    queryset = Revista.objects.all()
    serializer_class = RevistaSerializer

    @action(detail=False, methods=['post'], url_path='agregar_revista')
    def agregar_revista(self, request):
        if verificarToken.validarRol(request) is True:
            serializer = RevistaSerializer(data=request.data)
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
    
    @action(detail=True, methods=['put'], url_path='editar_revista')
    def editar_revista(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                revista = Revista.objects.get(pk=pk)
            except Revista.DoesNotExist:
                return Response({'error': 'Revista no encontrada'}, status=status.HTTP_404_NOT_FOUND)

            serializer = RevistaSerializer(revista, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='eliminar_revista')
    def eliminar_revista(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                revista = Revista.objects.get(pk=pk)
            except Revista.DoesNotExist:
                return Response({'error': 'Revista no encontrada'}, status=status.HTTP_404_NOT_FOUND)

            revista.delete()
            return Response({'Revista eliminada correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
        
    @action(detail=False, methods=['get'], url_path='listar_revistas')
    def listar_revistas(self, request):
        if verificarToken.validarRol(request) is True:
            revistas = Revista.objects.all()
            serializer = RevistaSerializer(revistas, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)