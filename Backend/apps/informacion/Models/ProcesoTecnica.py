from django.db import models
from apps.usuarios_roles.models import Usuario

class ProcesoTecnica(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=100)
    tipoProductividad = models.CharField(max_length=50)
    pais = models.CharField(max_length=50)
    anio = models.IntegerField()
    autores = models.JSONField(default=list, blank=True) # lista de strings
    etiquetasGTI = models.JSONField(default=list, blank=True) # lista de strings
    licencia = models.CharField(max_length=50)
    fechaPublicacion = models.DateField(auto_now_add=True)
    image_r2 = models.CharField(max_length=100, unique=True, blank=True, null=True) #Almacena la ruta en r2
    
    class Meta:
        db_table = 'proceso_tecnica'
    
    def __str__(self):
        return self.titulo