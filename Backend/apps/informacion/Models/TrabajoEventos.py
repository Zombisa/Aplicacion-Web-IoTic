from django.db import models
from apps.usuarios_roles.models import Usuario

class TrabajoEventos(models.Model):
    """Trabajo presentado en eventos/seminarios con datos de publicación y autores."""

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=200)
    tipoProductividad = models.CharField(max_length=100)
    volumen = models.IntegerField()
    nombreSeminario = models.CharField(max_length=100)
    tipoPresentacion = models.CharField(max_length=100)
    tituloActas = models.CharField(max_length=200)
    isbn = models.IntegerField()
    paginas = models.IntegerField()
    anio = models.IntegerField()
    etiquetas = models.JSONField(default=list, blank=True) # lista de strings
    propiedadIntelectual = models.CharField(max_length=200)
    autores = models.JSONField(default=list, blank=True) # lista de strings
    image_r2 = models.CharField(max_length=100, unique=True, blank=True, null=True) #Almacena la ruta en r2
    
    class Meta:
        db_table = 'trabajo_eventos'
    
    def __str__(self):
        return self.titulo