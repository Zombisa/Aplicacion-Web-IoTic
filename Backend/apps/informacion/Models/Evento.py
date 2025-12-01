from django.db import models
from apps.usuarios_roles.models import Usuario

class Evento(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=100)
    tipoProductividad = models.CharField(max_length=50)
    etiquetas = models.JSONField(default=list, blank=True) # lista de strings
    autores = models.JSONField(default=list, blank=True) # lista de strings
    propiedadIntelectual = models.CharField(max_length=100)
    alcance = models.CharField(max_length=100)
    institucion = models.CharField(max_length=50)
    fechaPublicacion = models.DateField(auto_now_add=True)
    image_r2 = models.CharField(max_length=100, unique=True, blank=True, null=True) #Almacena la ruta en r2

    class Meta:
        db_table = 'evento'

    def __str__(self):
        return self.nombre