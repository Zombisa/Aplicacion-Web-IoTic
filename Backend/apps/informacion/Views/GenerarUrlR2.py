from rest_framework import viewsets
from rest_framework.decorators import action
import uuid
from backend.serviceCloudflare.R2Service import generar_url_firmada
from rest_framework.response import Response
from rest_framework import status
from apps.informacion.permissions import verificarToken 

class GenerarURLR2ViewSet(viewsets.ViewSet):
    """Genera URLs firmadas para subir archivos a R2 (requiere rol válido).

    Entrada esperada: `extension` (ej. jpg, png) y `content_type` opcional.
    Salida: `upload_url` lista para PUT hacia R2 y `file_path` para guardar en el modelo.
    Errores: 403 si el token es inválido/expirado; 500 si falla la generación.
    """

    @action(detail=False, methods=['post'], url_path='generar-url')
    def post(self, request):
        """Devuelve `upload_url` y `file_path` listos para subir a R2.

        Entrada: cuerpo con `extension` (por defecto `jpg`) y `content_type` opcional.
        Salida: 200 con URL firmada y ruta de archivo; 403 si el rol es inválido; 500 si no se puede generar la URL.
        """
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
        