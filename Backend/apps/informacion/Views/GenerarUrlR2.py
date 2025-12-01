from rest_framework import viewsets
from rest_framework.decorators import action
import uuid
from backend.serviceCloudflare.R2Service import generar_url_firmada
from rest_framework.response import Response
from rest_framework import status
from apps.informacion.permissions import verificarToken 

class GenerarURLR2ViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'], url_path='generar-url')
    def post(self, request):
        if verificarToken.validarRol(request) is True:
            extension = request.data.get("extension", "jpg")
            nombre_archivo = f"{uuid.uuid4()}.{extension}"
            content_type = request.data.get("content_type")
            
            url_firmada = generar_url_firmada(nombre_archivo, content_type)

            return Response({
                "message": "URL firmada generada correctamente",
                "upload_url": url_firmada, #url que usara el front para subir la img a cloudflare R2
                "file_path": nombre_archivo #nombre del archivo en el bucket
            })
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)  
        