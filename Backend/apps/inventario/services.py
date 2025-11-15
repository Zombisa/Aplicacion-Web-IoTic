from django.utils import timezone
from rest_framework.exceptions import ValidationError
from .models import Inventario, Prestamo


def crear_items_masivo(data):
    descripcion = data.get("descripcion")
    cantidad = data.get("cantidad")
    estado_fisico = data.get("estado_fisico")
    estado_admin = data.get("estado_admin")
    observacion = data.get("observacion", "")

    # --- VALIDACIONES ---
    if not descripcion:
        raise ValidationError("La descripción es obligatoria.")

    if not cantidad or int(cantidad) < 1:
        raise ValidationError("La cantidad debe ser mayor o igual a 1.")

    creados = []
    for _ in range(int(cantidad)):
        item = Inventario.objects.create(
            descripcion=descripcion,
            estado_fisico=estado_fisico,
            estado_admin=estado_admin,
            observacion=observacion
        )
        creados.append(item)

    return creados


def registrar_prestamo(data):
    item = data.get("item")
    nombre_persona = data.get("nombre_persona")
    cedula = data.get("cedula")
    telefono = data.get("telefono")
    correo = data.get("correo")
    direccion = data.get("direccion")
    fecha_limite = data.get("fecha_limite")

    # --- VALIDACIONES ---
    if not item:
        raise ValidationError("El item es obligatorio.")

    if not isinstance(item, Inventario):
        raise ValidationError("El item no es válido.")

    if item.estado_admin == "No prestar":
        raise ValidationError("Este ítem no está disponible para préstamos.")

    if item.estado_admin == "Prestado":
        raise ValidationError("Este ítem ya está prestado actualmente.")

    if item.estado_fisico == "Dañado":
        raise ValidationError("Este ítem está dañado y no puede prestarse.")

    if not nombre_persona:
        raise ValidationError("El nombre de la persona es obligatorio.")

    if not cedula:
        raise ValidationError("La cédula es obligatoria.")

    if not telefono:
        raise ValidationError("El teléfono es obligatorio.")

    if not correo:
        raise ValidationError("El correo es obligatorio.")

    if not fecha_limite:
        raise ValidationError("Debe especificar una fecha límite de devolución.")

    # Validar fecha límite futura
    if timezone.now().date() > timezone.datetime.fromisoformat(fecha_limite).date():
        raise ValidationError("La fecha límite debe ser futura.")

    # Crear préstamo
    prestamo = Prestamo.objects.create(
        item=item,
        nombre_persona=nombre_persona,
        cedula=cedula,
        telefono=telefono,
        correo=correo,
        direccion=direccion,
        fecha_limite=fecha_limite
    )

    # actualizar estado del item
    item.estado_admin = "Prestado"
    item.save()

    return prestamo

def registrar_devolucion(prestamo: Prestamo):
    if prestamo.estado == "Devuelto":
        raise ValidationError("Este préstamo ya está devuelto.")

    # marcar devuelto
    prestamo.estado = "Devuelto"
    prestamo.fecha_devolucion = timezone.now()
    prestamo.save()

    # actualizar item
    item = prestamo.item
    item.estado_admin = "Disponible"
    item.save()

    return prestamo
