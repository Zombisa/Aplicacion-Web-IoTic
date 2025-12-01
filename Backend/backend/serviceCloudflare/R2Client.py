import boto3
from django.conf import settings


#crear el cliente de boto3 para R2 para poder hacer acciones como subir, crear urles firmadas, borrar,
# listar. etc 
s3 = boto3.client(
    "s3",
    region_name="auto",
    endpoint_url=settings.R2_ENDPOINT,
    aws_access_key_id=settings.R2_ACCESS_KEY_ID,
    aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY
)