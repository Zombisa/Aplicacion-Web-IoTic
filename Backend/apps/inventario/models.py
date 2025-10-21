from django.db import models

class Inventario(models.Model):
    TIPO_CHOICES = (
        ('devolutivo', 'Devolutivo'),
        ('consumible', 'Consumible'),
    )
    
    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    cantidad_total = models.PositiveIntegerField()
    cantidad_disponible = models.PositiveIntegerField()
    cantidad_prestada = models.PositiveIntegerField(default=0)
    estado = models.CharField(max_length=20, default='disponible')
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
