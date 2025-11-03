from django.db import models

class Inventario(models.Model):
    
    ESTADO_FISICO_CHOICES = (
        ('excelente', 'Excelente'),
        ('bueno', 'Bueno'),
        ('regular', 'Regular'),
        ('defectuoso', 'Defectuoso'),
        ('dañado', 'Dañado'),
        ('en mantenimiento', 'En mantenimiento'),
        ('obsoleto', 'Obsoleto'),
    )
    
    ESTADO_ADMINISTRATIVO_CHOICES = (
        ('disponible', 'Disponible'),
        ('prestado', 'Prestado'),
        ('asignado', 'Asignado'),
        ('dado de baja', 'Dado de baja'),
    )
    
    numeroSerieActivo = models.PositiveIntegerField() # numero de serie o activo
    descripcionArticulo = models.CharField(max_length=100) # descripcion del articulo (marca y modelo)
    cantidad_disponible = models.PositiveIntegerField(default = 1) # cantidad disponible para prestar
    cantidad_prestada = models.PositiveIntegerField(default=0) # cantidad actualmente prestada
    ubicacion = models.CharField(max_length=100) 
    estadoFisico = models.CharField(max_length=100, choices=ESTADO_FISICO_CHOICES, default='excelente') 
    estadoAdministrativo = models.CharField(max_length=100, choices=ESTADO_ADMINISTRATIVO_CHOICES, default='disponible')
    observacion = models.TextField(blank=True) # segun la documentacion son cajas
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre


class Prestamo(models.Model):
    ESTADO_CHOICES = (
        ('prestado', 'Prestado'),
        ('devuelto', 'Devuelto'),
    )

    nombre_persona = models.CharField(max_length=100, default="Desconocido")
    item = models.ForeignKey(Inventario, on_delete=models.PROTECT, related_name='prestamos')
    fecha_prestamo = models.DateTimeField(auto_now_add=True)
    fecha_devolucion = models.DateTimeField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='prestado')

    def __str__(self):
        return f"{self.nombre_persona} - {self.item.nombre}"
