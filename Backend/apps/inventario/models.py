from django.db import models

class Inventario(models.Model):
    serial = models.CharField(max_length=20, unique=True, default='')
    descripcion = models.TextField(default="Sin descripción")

    ESTADO_FISICO_CHOICES = [
        ('Excelente', 'Excelente'),
        ('Bueno', 'Bueno'),
        ('Dañado', 'Dañado'),
    ]

    estado_fisico = models.CharField(
        max_length=20,
        choices=ESTADO_FISICO_CHOICES,
        default='Excelente'
    )

    ESTADO_ADMIN_CHOICES = [
        ('Disponible', 'Disponible'),
        ('Prestado', 'Prestado'),
        ('No prestar', 'No prestar'),
    ]

    estado_admin = models.CharField(
        max_length=20,
        choices=ESTADO_ADMIN_CHOICES,
        default='Disponible'
    )

    fecha_registro = models.DateTimeField(auto_now_add=True)
    observacion = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        # Generar serial solo si no existe
        if not self.serial:
            ultimo = Inventario.objects.order_by('-id').first()
            
            if ultimo and ultimo.serial:
                # Extraer número del serial previo
                try:
                    ultimo_numero = int(ultimo.serial.split('-')[1])
                except:
                    ultimo_numero = ultimo.id  # fallback seguro

                nuevo_numero = ultimo_numero + 1
            else:
                nuevo_numero = 1  # primer item del sistema

            self.serial = f"ITM-{nuevo_numero:05d}"  # formato ITM-00001

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.serial} - {self.descripcion[:20]}"


class Prestamo(models.Model):
    ESTADO_CHOICES = [
        ('Prestado', 'Prestado'),
        ('Devuelto', 'Devuelto'),
    ]

    item = models.ForeignKey(Inventario, on_delete=models.PROTECT, related_name='prestamos')

    # Datos del solicitante
    nombre_persona = models.CharField(max_length=100, default="nombre")
    cedula = models.CharField(max_length=30, default="cedula")
    telefono = models.CharField(max_length=20, default="telefono")
    correo = models.EmailField(default="correo")
    direccion = models.CharField(max_length=200, default="direccion")

    fecha_prestamo = models.DateTimeField(auto_now_add=True)
    fecha_limite = models.DateTimeField(auto_now=True)
    fecha_devolucion = models.DateTimeField(null=True, blank=True)

    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='Prestado'
    )

    def __str__(self):
        return f"{self.nombre_persona} - {self.item.serial}"
