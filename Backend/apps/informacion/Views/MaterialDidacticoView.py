from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.MaterialDidactico import MaterialDidactico
from apps.informacion.Serializers.MaterialDidacticoSerializer import MaterialDidacticoSerializer

class MaterialDidacticoViewSet(viewsets.ModelViewSet):
    queryset = MaterialDidactico.objects.all()
    serializer_class = MaterialDidacticoSerializer

    @action(detail=False, methods=['post'], url_path='agregar_material_did')
    def agregar_material_did(self, request):
        if verificarToken.validarRol(request) is True:
            serializer = MaterialDidacticoSerializer(data=request.data)
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
    
    @action(detail=True, methods=['put'], url_path='editar_material_did')
    def editar_material_did(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                material_didactico = MaterialDidactico.objects.get(pk=pk)
            except MaterialDidactico.DoesNotExist:
                return Response({'error': 'Material didactico no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            serializer = MaterialDidacticoSerializer(material_didactico, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
        
    @action(detail=True, methods=['delete'], url_path='eliminar_material_did')
    def eliminar_material_did(self, request, pk):
        if verificarToken.validarRol(request) is True:
            try:
                material_didactico = MaterialDidactico.objects.get(pk=pk)
            except MaterialDidactico.DoesNotExist:
                return Response({'error': 'Material didactico no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            material_didactico.delete()
            return Response({'Material didactico eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=False, methods=['get'], url_path='listar_materiales_did')
    def listar_materiales_did(self, request):
        if verificarToken.validarRol(request) is True:
            materiales_didacticos = MaterialDidactico.objects.all()
            serializer = MaterialDidacticoSerializer(materiales_didacticos, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)