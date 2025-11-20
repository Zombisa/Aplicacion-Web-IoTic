from django.db import models
from apps.usuarios_roles.models import Usuario

class Jurado(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=100)
    tipoProductividad = models.CharField(max_length=50)
    pais = models.CharField(max_length=50)
    anio = models.IntegerField()
    orientados = models.JSONField(default=list, blank=True) # lista de strings
    programa = models.CharField(max_length=100)
    institucion = models.CharField(max_length=50)
    autores=  models.JSONField(default=list, blank=True) # lista de strings
    etiquetas = models.JSONField(default=list, blank=True)
    licencia = models.CharField(max_length=50)
    fechaPublicacion = models.DateField(auto_now_add=True)
    
    class Meta:
        db_table = 'jurado'
    
    def __str__(self):
        return self.titulo