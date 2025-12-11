from django.db import models
from django.core.validators import RegexValidator
from apps.usuarios_roles.models import Usuario

class Software(models.Model):
    """Desarrollo de software registrado con código, licenciamiento y metadatos."""

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=200)
    tipoProductividad = models.CharField(max_length=100)
    etiquetas = models.JSONField(default=list, blank=True) 
    nivelAcceso = models.CharField(max_length=100)
    tipoProducto = models.CharField(max_length=100)
    pais = models.CharField(max_length=100)
    responsable = models.JSONField(default=list, blank=True)
    codigoRegistro = models.CharField(max_length=20, blank=True, null=True)
    descripcionFuncional = models.CharField(max_length=500)
    propiedadIntelectual = models.CharField(max_length=200)
    fechaPublicacion = models.DateField(auto_now_add=True)
    image_r2 = models.CharField(max_length=100, unique=True, blank=True, null=True) #Almacena la ruta en r2
    file_r2 = models.CharField(max_length=200, unique=True, blank=True, null=True) #Almacena la ruta de un archivo en r2
    
    class Meta:
        db_table = 'software'