from django.db import models
from django.contrib.auth.models import User

class Inventario(models.Model):
    TIPO_CHOICES = [
        ('devolutivo', 'Devolutivo'),
        ('consumible', 'Consumible'),
    ]

    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    cantidad_total = models.PositiveIntegerField(default=0)
    cantidad_disponible = models.PositiveIntegerField(default=0)
    cantidad_prestada = models.PositiveIntegerField(default=0)
    estado = models.CharField(max_length=20, default='activo')
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} ({self.tipo})"


class Prestamo(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('devuelto', 'Devuelto'),
        ('vencido', 'Vencido'),
    ]

    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    item = models.ForeignKey(Inventario, on_delete=models.CASCADE)
    fecha_prestamo = models.DateField(auto_now_add=True)
    fecha_devolucion = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')

    def __str__(self):
        return f"Préstamo de {self.item.nombre} a {self.usuario.username}"
