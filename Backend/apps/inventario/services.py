from django.utils import timezone
from rest_framework.exceptions import ValidationError
from .models import Inventario, Prestamo
from django.conf import settings

def crear_items_masivo(data):

    # ===========================================================
    #   CASO 1 — OBJETO ÚNICO CON "cantidad"
    # ===========================================================
    if isinstance(data, dict):

        if "cantidad" not in data:
            raise ValidationError("Si envías un objeto único debes incluir 'cantidad'.")

        cantidad = int(data.get("cantidad", 0))

        if cantidad < 1:
            raise ValidationError("La cantidad debe ser mayor o igual a 1.")

        # Validar imágenes múltiples
        imagenes = data.get("imagenes", None)  # lista opcional

        if imagenes is not None:
            if not isinstance(imagenes, list):
                raise ValidationError("'imagenes' debe ser una lista de file_paths.")

            if len(imagenes) != cantidad:
                raise ValidationError(
                    f"Debes enviar exactamente {cantidad} imágenes en la lista 'imagenes'."
                )

        # generar lista de items
        lista_items = []

        for i in range(cantidad):

            item_copy = data.copy()
            item_copy.pop("cantidad", None)
            item_copy.pop("imagenes", None)

            # asignar imagen correspondiente (si existe)
            if imagenes:
                item_copy["file_path"] = imagenes[i]

            lista_items.append(item_copy)

        data = lista_items  # Convertir a lista


    # ===========================================================
    #   CASO 2 — RECIBE UNA LISTA COMPLETA
    # ===========================================================
    elif not isinstance(data, list):
        raise ValidationError(
            "El cuerpo debe ser una lista de ítems o un objeto con 'cantidad'."
        )


    # ===========================================================
    #   PROCESAR LISTA DE ÍTEMS
    # ===========================================================
    creados = []

    for item_data in data:

        if not isinstance(item_data, dict):
            raise ValidationError("Cada ítem debe ser un objeto JSON válido.")

        item_data = item_data.copy()

        # ---------- Validaciones obligatorias ----------
        if "descripcion" not in item_data:
            raise ValidationError("Cada ítem debe tener 'descripcion'.")

        if "estado_fisico" not in item_data:
            raise ValidationError("Cada ítem debe tener 'estado_fisico'.")

        if "estado_admin" not in item_data:
            raise ValidationError("Cada ítem debe tener 'estado_admin'.")

        # ---------- Procesar imagen ----------
        file_path = item_data.pop("file_path", None)

        if file_path:
            full_url = f"{settings.R2_BUCKET_PATH}/{file_path}"
            item_data["image_r2"] = full_url

        # ---------- Crear item ----------
        item = Inventario.objects.create(**item_data)
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
