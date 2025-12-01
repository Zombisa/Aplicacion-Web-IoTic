from django.db import models
from django.core.validators import RegexValidator
from apps.usuarios_roles.models import Usuario

class Software(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    tituloDesarrollo = models.CharField(max_length=200)
    tipoProductividad = models.CharField(max_length=100)
    etiquetas = models.JSONField(default=list, blank=True) 
    nivelAcceso = models.CharField(max_length=100)
    tipoProducto = models.CharField(max_length=100)
    pais = models.CharField(max_length=100)
    responsable = models.JSONField(default=list, blank=True)
    codigoRegistro = models.CharField(max_length=20, unique=True, blank=True, null=True, validators=[
         RegexValidator(
                regex=r'^[A-Z]+:\d{3}-\d{3}$',
                message='El código debe tener el formato DERAUTOR:259-124 (prefijo mayúsculas, guion, 4 dígitos).',
                code='invalid_code'
        )
    ])
    descripcionFuncional = models.CharField(max_length=500)
    propiedadIntelectual = models.CharField(max_length=200)
    fechaPublicacion = models.DateField(auto_now_add=True)
    image_r2 = models.CharField(max_length=100, unique=True, blank=True, null=True) #Almacena la ruta en r2
    
    class Meta:
        db_table = 'software'