from django.db import models
from apps.usuarios_roles.models import Usuario

class Libro(models.Model):
    """Libro publicado por un usuario con metadatos editoriales e imagen opcional en R2."""

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=200)
    tipoProductividad = models.CharField(max_length=100)
    pais = models.CharField(max_length=100)
    anio = models.IntegerField()
    isbn = models.IntegerField()
    volumen = models.IntegerField()
    paginas = models.IntegerField()
    editorial = models.CharField(max_length=200)
    codigoEditorial = models.CharField(max_length=100)
    etiquetas = models.JSONField(default=list, blank=True) # lista de strings
    propiedadIntelectual = models.CharField(max_length=200)
    autores = models.JSONField(default=list, blank=True) # lista de strings
    image_r2 = models.CharField(max_length=100, unique=True, blank=True, null=True) #Almacena la ruta en r2
    file_r2 = models.CharField(max_length=200, unique=True, blank=True, null=True) #Almacena la ruta de un archivo en r2
    
    class Meta:
        db_table = 'libro'
    
    def __str__(self):
        return self.titulo