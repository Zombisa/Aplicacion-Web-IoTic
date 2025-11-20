from django.db import models
from apps.usuarios_roles.models import Usuario

class TutoriaEnMarcha(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=100)
    subtipoTitulo = models.CharField(max_length=100)
    tipoProductividad = models.CharField(max_length=50)
    descripcion = models.CharField(max_length=250)
    pais = models.CharField(max_length=50)
    anio = models.IntegerField()
    orientados = models.JSONField(default=list, blank=True)
    programa = models.CharField(max_length=100)
    institucion = models.CharField(max_length=50)
    autores = models.JSONField(default=list, blank=True)
    etiquetasGTI = models.JSONField(default=list, blank=True)
    licencia = models.CharField(max_length=50)
    fechaPublicacion = models.DateField(auto_now_add=True)
    
    class Meta:
        db_table = 'tutorias_en_marcha'
    
    def __str__(self):
        return self.titulo