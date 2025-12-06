from django.db import models
from apps.usuarios_roles.models import Usuario

class Revista(models.Model):
    """Artículo en revista con ISSN, volumen/fascículo y enlaces opcionales."""

    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=200)
    issn = models.IntegerField()
    volumen = models.IntegerField()
    fasc = models.IntegerField()
    linkDescargaArticulo = models.URLField(max_length=200, blank=True, null = True)
    linksitioWeb = models.URLField(max_length=200, blank=True, null = True)
    autores = models.JSONField(default=list, blank=True)
    paginas = models.IntegerField()
    responsable = models.JSONField(default=list, blank=True)
    image_r2 = models.CharField(max_length=100, unique=True, blank=True, null=True) #Almacena la ruta en r2

    class Meta:
        db_table = 'revista'
    
    def __str__(self):
        return self.titulo