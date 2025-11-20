from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.informacion.Models.Curso import Curso
from apps.informacion.Serializers.CursoSerializer import CursoSerializer
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken

class CursoViewSet(viewsets.ModelViewSet):
    queryset = Curso.objects.all()
    serializer_class = CursoSerializer

    @action(detail=False, methods=['post'], url_path='agregar_curso')
    def agregar_curso(self, request):
        if verificarToken.validarRol(request) is True:
            serializer = CursoSerializer(data=request.data)
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

    @action(detail=True, methods=['put'], url_path='editar_curso')
    def editar_curso(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                curso = Curso.objects.get(pk=pk)
            except Curso.DoesNotExist:
                return Response({'error': 'Curso no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            serializer = CursoSerializer(curso, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=['delete'], url_path='eliminar_curso')
    def eliminar_curso(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                curso = Curso.objects.get(pk=pk)
            except Curso.DoesNotExist:
                return Response({'error': 'Curso no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            curso.delete()
            return Response({'Curso eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
           return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=False, methods=['get'], url_path='listar_cursos')
    def listar_cursos(self, request):
        if verificarToken.validarRol(request) is True:
            cursos = Curso.objects.all()
            serializer = CursoSerializer(cursos, many=True)
            return Response(serializer.data)
        else:
           return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
