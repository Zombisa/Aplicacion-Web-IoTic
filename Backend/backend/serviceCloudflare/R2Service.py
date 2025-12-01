from django.conf import settings
from backend.serviceCloudflare.R2Client import s3

def generar_url_firmada(nombre_archivo, content_type):
    if not settings.R2_BUCKET_NAME:
        raise ValueError("R2_BUCKET_NAME no está configurado")
    return s3.generate_presigned_url(
        'put_object',
        Params={
            'Bucket': settings.R2_BUCKET_NAME,
            'Key': nombre_archivo,
            'ContentType': content_type
        },
        ExpiresIn=60 #cantidad de segundos que la URL será válida
    )