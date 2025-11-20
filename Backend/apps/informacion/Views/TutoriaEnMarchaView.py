from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.TutoriaEnMarcha import TutoriaEnMarcha
from apps.informacion.Serializers.TutoriaEnMarchaSerializer import TutoriaEnMarchaSerializer

class TutoriaEnMarchaViewSet(viewsets.ModelViewSet):
    queryset = TutoriaEnMarcha.objects.all()
    serializer_class = TutoriaEnMarchaSerializer

    @action(detail=False, methods=['post'], url_path='agregar_tutoria_en_marcha')
    def agregar_tutoria_en_marcha(self, request):
        if verificarToken.validarRol(request) is True:
            serializer = TutoriaEnMarchaSerializer(data=request.data)
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
    
    @action(detail=True, methods=['put'], url_path='editar_tutoria_en_marcha')
    def editar_tutoria_en_marcha(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                tutoria_en_marcha = TutoriaEnMarcha.objects.get(pk=pk)
            except TutoriaEnMarcha.DoesNotExist:
                return Response({'error': 'Tutoría en marcha no encontrada'}, status=status.HTTP_404_NOT_FOUND)

            serializer = TutoriaEnMarchaSerializer(tutoria_en_marcha, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='eliminar_tutoria_en_marcha')
    def eliminar_tutoria_en_marcha(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                tutoria_en_marcha = TutoriaEnMarcha.objects.get(pk=pk)
            except TutoriaEnMarcha.DoesNotExist:
                return Response({'error': 'Tutoría en marcha no encontrada'}, status=status.HTTP_404_NOT_FOUND)

            tutoria_en_marcha.delete()
            return Response({'Tutoría en marcha eliminada correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
        
    @action(detail=False, methods=['get'], url_path='listar_tutorias_en_marcha')
    def listar_tutorias_en_marcha(self, request):
        if verificarToken.validarRol(request) is True:
            tutorias_en_marcha = TutoriaEnMarcha.objects.all()
            serializer = TutoriaEnMarchaSerializer(tutorias_en_marcha, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)