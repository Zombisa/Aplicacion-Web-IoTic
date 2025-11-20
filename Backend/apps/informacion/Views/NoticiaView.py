from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.informacion.Models.Noticia import Noticia
from apps.informacion.Serializers.NoticiaSerializer import NoticiaSerializer
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken

class NoticiaViewSet(viewsets.ModelViewSet):
    queryset = Noticia.objects.all()
    serializer_class = NoticiaSerializer
    
    @action(detail=False, methods=['post'], url_path='publicar_noticia')
    def publicar_noticia(self, request):
        if verificarToken.validarRol(request) is True:
            serializer = NoticiaSerializer(data=request.data)
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

    @action(detail=True, methods=['put'], url_path='editar_noticia')
    def editar_noticia(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                noticia = Noticia.objects.get(pk=pk)
            except Noticia.DoesNotExist:
                return Response({'error': 'Noticia no encontrada'}, status=status.HTTP_404_NOT_FOUND)

            serializer = NoticiaSerializer(noticia, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='eliminar_noticia')
    def eliminar_noticia(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                noticia = Noticia.objects.get(pk=pk)
            except Noticia.DoesNotExist:
                return Response({'error': 'Noticia no encontrada'}, status=status.HTTP_404_NOT_FOUND)

            noticia.delete()
            return Response({'Noticia eliminada correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=False, methods=['get'], url_path='listar_noticias')
    def listar_noticias(self, request):
        if verificarToken.validarRol(request) is True:
            noticias = Noticia.objects.all()
            serializer = NoticiaSerializer(noticias, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)