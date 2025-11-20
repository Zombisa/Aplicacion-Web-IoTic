from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.Libro import Libro
from apps.informacion.Serializers.LibroSerializer import LibroSerializer

class LibroViewSet(viewsets.ModelViewSet):
    queryset = Libro.objects.all()
    serializer_class = LibroSerializer

    @action(detail=False, methods=['post'], url_path='agregar_libro')
    def agregar_libro(self, request):
        if verificarToken.validarRol(request) is True:
            serializer = LibroSerializer(data=request.data)
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
        
    @action(detail=True, methods=['put'], url_path='editar_libro')
    def editar_libro(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                libro = Libro.objects.get(pk=pk)
            except Libro.DoesNotExist:
                return Response({'error': 'Libro no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            serializer = LibroSerializer(libro, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='eliminar_libro')
    def eliminar_libro(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                libro = Libro.objects.get(pk=pk)
            except Libro.DoesNotExist:
                return Response({'error': 'Libro no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            libro.delete()
            return Response({'Libro eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
        
    @action(detail=False, methods=['get'], url_path='listar_libros')
    def listar_libros(self, request):
        if verificarToken.validarRol(request) is True:
            libros = Libro.objects.all()
            serializer = LibroSerializer(libros, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)