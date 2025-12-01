from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.TutoriaEnMarcha import TutoriaEnMarcha
from apps.informacion.Serializers.TutoriaEnMarchaSerializer import TutoriaEnMarchaSerializer
from django.conf import settings
import uuid
from backend.serviceCloudflare.R2Service import generar_url_firmada
from backend.serviceCloudflare.R2Client import s3

class TutoriaEnMarchaViewSet(viewsets.ModelViewSet):
    queryset = TutoriaEnMarcha.objects.all()
    serializer_class = TutoriaEnMarchaSerializer

    @action(detail=False, methods=['post'], url_path='agregar_tutoria_en_marcha')
    def agregar_tutoria_en_marcha(self, request):
        if verificarToken.validarRol(request) is True:
            data = request.data.copy()
            # si existe file_path, construir la URL completa
            file_path = data.pop("file_path", None)

            if file_path:
                # crear la URL usando tu dominio público del bucket
                full_url = f"{settings.R2_BUCKET_PATH}/{file_path}"
                data["image_r2"] = full_url
            serializer = TutoriaEnMarchaSerializer(data=data)
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
    
    @action(detail=True, methods=['delete'], url_path='eliminar-imagen')
    def eliminar_imagen(self, request, pk):
        TutoriaEnMarcha = self.get_object()

        if not TutoriaEnMarcha.image_r2:
            return Response({"message": "La tutoria en marcha no tiene imagen"}, status=status.HTTP_400_BAD_REQUEST)

        # extraer solo el nombre del archivo
        file_path = TutoriaEnMarcha.image_r2.split("/")[-1]

        try:
            s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=file_path)
        except Exception as e:
            return Response({"error": f"No se pudo eliminar la imagen en R2: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # actualizar campo image_r2 a None 
        TutoriaEnMarcha.image_r2 = None
        TutoriaEnMarcha.save()
        return Response({"message": "imagen eliminada correctamente"}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='listar-imagenes')
    def listar_imagenes(self, request):
        try:
            response = s3.list_objects_v2(Bucket=settings.R2_BUCKET_NAME)
            archivos = [obj['Key'] for obj in response.get('Contents', [])]
            # Construir URLs públicas
            urls = [f"{settings.R2_BUCKET_PATH}/{key}" for key in archivos]
            return Response(urls)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)