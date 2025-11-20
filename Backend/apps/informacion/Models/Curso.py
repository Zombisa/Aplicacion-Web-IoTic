from django.db import models
from apps.usuarios_roles.models import Usuario

class Curso(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=200)
    tipoProductividad = models.CharField(max_length=100)
    etiquetas = models.JSONField(default=list, blank=True) # lista de strings
    autores = models.JSONField(default=list, blank=True) # lista de strings
    propiedadIntelectual = models.CharField(max_length=200)
    duracion = models.IntegerField()
    institucion = models.CharField(max_length=20)
    fechaPublicacion = models.DateField(auto_now_add=True)
    linkVideo = models.URLField(max_length=200, blank=True, null = True)    

    class Meta:
        db_table = 'curso'

    def __str__(self):
        return self.nombre