from django.db import models
from apps.usuarios_roles.models import Usuario

class RegistroFotografico(models.Model):
    """Registro fotográfico con título, fecha y descripción opcionales, y foto obligatoria en R2."""

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=200, blank=True, null=True)
    fecha = models.DateField(blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)
    foto_r2 = models.CharField(max_length=200, unique=True)  # Almacena la ruta de la foto en R2
    
    class Meta:
        db_table = 'registro_fotografico'
    
    def __str__(self):
        return self.titulo or f"Foto {self.id}"
