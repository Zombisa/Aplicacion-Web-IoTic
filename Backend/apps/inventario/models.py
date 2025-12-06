from django.db import models

class Inventario(models.Model):
    """
    Modelo que representa un ítem de inventario.
    
    Cada ítem tiene un serial único, descripción y estados tanto físicos como administrativos.
    Los ítems pueden ser prestados y se registra su historial de préstamos.
    
    Atributos:
        serial (str): Identificador único autogenerado con formato ITM-00001
        descripcion (str): Descripción del ítem
        estado_fisico (str): Estado físico del ítem (Excelente, Bueno, Dañado)
        estado_admin (str): Estado administrativo (Disponible, Prestado, No prestar)
        fecha_registro (datetime): Fecha de creación del registro
        observacion (str): Notas adicionales sobre el ítem
        image_r2 (str): URL de imagen almacenada en R2 (Cloudflare)
    """
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
    image_r2 = models.CharField(max_length=100, blank=True, null=True) #Almacena la ruta en r2 

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
    """
    Modelo que registra un préstamo de un ítem del inventario.
    
    Mantiene información completa del prestatario, fechas del préstamo y fotos
    de entrega/devolución para auditoría.
    
    Atributos:
        item (ForeignKey): Referencia al ítem prestado
        nombre_persona (str): Nombre completo del prestatario
        cedula (str): Cédula de identidad del prestatario
        telefono (str): Teléfono de contacto (mín 7 caracteres, debe contener dígitos)
        correo (str): Email del prestatario (formato válido requerido)
        direccion (str): Dirección del prestatario
        fecha_prestamo (datetime): Fecha/hora de creación del préstamo (auto)
        fecha_limite (datetime): Fecha máxima de devolución (debe ser futura)
        fecha_devolucion (datetime): Fecha/hora de devolución real (null hasta devolver)
        estado (str): Estado del préstamo (Prestado, Devuelto)
        foto_entrega (str): URL de foto en R2 al momento de entrega (opcional)
        foto_devolucion (str): URL de foto en R2 al momento de devolución (opcional)
    
    Validaciones:
        - Todos los campos de prestatario son obligatorios
        - fecha_limite debe ser posterior a fecha_prestamo
        - fecha_devolucion (si existe) debe ser posterior a fecha_prestamo
        - El email debe tener formato válido
        - El teléfono debe tener al menos 7 caracteres y contener dígitos
    """
    ESTADO_CHOICES = [
        ('Prestado', 'Prestado'),
        ('Devuelto', 'Devuelto'),
    ]

    item = models.ForeignKey(Inventario, on_delete=models.PROTECT, related_name='prestamos')

    # Snapshot del item al momento del préstamo (para preservar histórico)
    item_serial_snapshot = models.CharField(max_length=20, blank=True, null=True)
    item_descripcion_snapshot = models.TextField(blank=True, null=True)
    item_estado_fisico_snapshot = models.CharField(max_length=20, blank=True, null=True)
    item_estado_admin_snapshot = models.CharField(max_length=20, blank=True, null=True)

    # Datos del solicitante
    nombre_persona = models.CharField(max_length=100, blank=False, null=False)
    cedula = models.CharField(max_length=30, blank=False, null=False)
    telefono = models.CharField(max_length=20, blank=False, null=False)
    correo = models.EmailField(blank=False, null=False)
    direccion = models.CharField(max_length=200, blank=False, null=False)

    fecha_prestamo = models.DateTimeField(auto_now_add=True)
    fecha_limite = models.DateTimeField()
    fecha_devolucion = models.DateTimeField(null=True, blank=True)
    foto_entrega = models.CharField(max_length=100, blank=True, null=True) #Almacena la ruta en r2 
    foto_devolucion = models.CharField(max_length=100, blank=True, null=True) #Almacena la ruta en r2 

    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='Prestado'
    )

    def __str__(self):
        return f"{self.nombre_persona} - {self.item.serial}"
