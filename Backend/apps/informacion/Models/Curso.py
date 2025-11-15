from django.db import models
from apps.usuarios_roles.models import Usuario

class Curso(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField()
    duracion = models.CharField(max_length=100)
    enlace = models.URLField()
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)

    class Meta:
        db_table = 'curso'

    def __str__(self):
        return self.nombre