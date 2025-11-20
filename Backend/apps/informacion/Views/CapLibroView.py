from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.CapLibro import CapLibro
from apps.informacion.Serializers.CapLibroSerializer import CapLibroSerializer

class CapLibroViewSet(viewsets.ModelViewSet):
    queryset = CapLibro.objects.all()
    serializer_class = CapLibroSerializer

    @action(detail=False, methods=['post'], url_path='agregar_capitulo_libro')
    def agregar_capitulo_libro(self, request):
        if verificarToken.validarRol(request) is True:
            serializer = CapLibroSerializer(data=request.data)
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
    
    @action(detail=True, methods=['put'], url_path='editar_capitulo_libro')
    def editar_capitulo_libro(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                cap_libro = CapLibro.objects.get(pk=pk)
            except CapLibro.DoesNotExist:
                return Response({'error': 'Capítulo de libro no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            serializer = CapLibroSerializer(cap_libro, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='eliminar_capitulo_libro')
    def eliminar_capitulo_libro(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                cap_libro = CapLibro.objects.get(pk=pk)
            except CapLibro.DoesNotExist:
                return Response({'error': 'Capítulo de libro no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            cap_libro.delete()
            return Response({'Capítulo de libro eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=False, methods=['get'], url_path='listar_capitulos_libro')
    def listar_capitulos_libro(self, request):
        if verificarToken.validarRol(request) is True:
            capitulos = CapLibro.objects.all()
            serializer = CapLibroSerializer(capitulos, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)