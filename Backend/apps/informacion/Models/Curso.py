from django.db import models
from apps.usuarios_roles.models import Usuario

class Curso(models.Model):
    """Curso o taller impartido por un usuario, con detalles de edición y certificación."""

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
    image_r2 = models.CharField(max_length=100, unique=True, blank=True, null=True) #Almacena la ruta en r2

    class Meta:
        db_table = 'curso'

    def __str__(self):
        return self.nombre