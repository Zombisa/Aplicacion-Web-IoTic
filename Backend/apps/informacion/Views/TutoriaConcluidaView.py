from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.TutoriaConcluida import TutoriaConcluida
from apps.informacion.Serializers.TutoriaConcluidaSerializer import TutoriaConcluidaSerializer

class TutoriaConcluidaViewSet(viewsets.ModelViewSet):
    queryset = TutoriaConcluida.objects.all()
    serializer_class = TutoriaConcluidaSerializer

    @action(detail=False, methods=['post'], url_path='agregar_tutoria_concluida')
    def agregar_tutoria_concluida(self, request):
        if verificarToken.validarRol(request) is True:
            serializer = TutoriaConcluidaSerializer(data=request.data)
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
    
    @action(detail=True, methods=['put'], url_path='editar_tutoria_concluida')
    def editar_tutoria_concluida(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                tutoria_concluida = TutoriaConcluida.objects.get(pk=pk)
            except TutoriaConcluida.DoesNotExist:
                return Response({'error': 'Tutoría concluida no encontrada'}, status=status.HTTP_404_NOT_FOUND)

            serializer = TutoriaConcluidaSerializer(tutoria_concluida, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='eliminar_tutoria_concluida')
    def eliminar_tutoria_concluida(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                tutoria_concluida = TutoriaConcluida.objects.get(pk=pk)
            except TutoriaConcluida.DoesNotExist:
                return Response({'error': 'Tutoría concluida no encontrada'}, status=status.HTTP_404_NOT_FOUND)

            tutoria_concluida.delete()
            return Response({'Tutoría concluida eliminada correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=False, methods=['get'], url_path='listar_tutorias_concluidas')
    def listar_tutorias_concluidas(self, request):
        if verificarToken.validarRol(request) is True:
            tutorias_concluidas = TutoriaConcluida.objects.all()
            serializer = TutoriaConcluidaSerializer(tutorias_concluidas, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)