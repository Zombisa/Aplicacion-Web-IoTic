from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from rest_framework.exceptions import ValidationError
from .models import Inventario, Prestamo
from django.conf import settings
from datetime import timedelta


def calcular_fecha_limite_default():
    """Calcula la fecha límite por defecto: ahora + 7 días"""
    return timezone.now() + timedelta(days=7)

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

        # imágenes múltiples (opcional)
        imagenes = data.get("imagenes", None)

        # imagen única (opcional)
        file_path_unico = data.get("file_path", None)

        # ─────────────────────────────────────────────────────────────
        # VALIDAR: no permitir file_path único cuando cantidad > 1
        # ─────────────────────────────────────────────────────────────
        if cantidad > 1 and file_path_unico:
            raise ValidationError(
                "No puedes usar un 'file_path' único cuando la cantidad es mayor a 1. "
                "Debes usar 'imagenes' para enviar imágenes diferentes por ítem."
            )

        # ─────────────────────────────────────────────────────────────
        # VALIDAR: lista de imágenes EXIGE coincidencia exacta
        # ─────────────────────────────────────────────────────────────
        if imagenes is not None:

            if not isinstance(imagenes, list):
                raise ValidationError("'imagenes' debe ser una lista de file_paths.")

            if len(imagenes) != cantidad:
                raise ValidationError(
                    f"Debes enviar exactamente {cantidad} imágenes diferentes en 'imagenes'."
                )

        # ─────────────────────────────────────────────────────────────
        #   GENERAR ITEMS A PARTIR DE CANTIDAD
        # ─────────────────────────────────────────────────────────────
        lista_items = []

        for i in range(cantidad):

            item_copy = data.copy()
            item_copy.pop("cantidad", None)
            item_copy.pop("imagenes", None)

            # asignar imagen correcta
            if imagenes is not None:
                # imágenes diferentes → OK
                item_copy["file_path"] = imagenes[i]

            else:
                # file_path único permitido solo si cantidad == 1
                if cantidad == 1 and file_path_unico:
                    item_copy["file_path"] = file_path_unico
                else:
                    # eliminar file_path si no aplica
                    item_copy.pop("file_path", None)

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
        
        # Validar que estado_fisico sea válido
        estados_fisicos_validos = ['Excelente', 'Bueno', 'Dañado']
        if item_data["estado_fisico"] not in estados_fisicos_validos:
            raise ValidationError(f"estado_fisico debe ser uno de: {estados_fisicos_validos}")

        if "estado_admin" not in item_data:
            raise ValidationError("Cada ítem debe tener 'estado_admin'.")
        
        # Validar que estado_admin sea válido
        estados_admin_validos = ['Disponible', 'Prestado', 'No prestar']
        if item_data["estado_admin"] not in estados_admin_validos:
            raise ValidationError(f"estado_admin debe ser uno de: {estados_admin_validos}")

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

    # ------------------------------
    # Obtener item
    # ------------------------------
    item = data.get("item")

    if not item or not isinstance(item, Inventario):
        raise ValidationError("El item no es válido.")

    # ------------------------------
    # VALIDACIÓN ROBUSTA
    # ------------------------------

    # 1. ¿Ya tiene un préstamo activo?
    if Prestamo.objects.filter(item=item, estado="Prestado").exists():
        raise ValidationError("Este ítem ya tiene un préstamo activo.")

    # 2. ¿No se debe prestar?
    if item.estado_admin == "No prestar":
        raise ValidationError("Este ítem no está disponible para préstamos.")

    # 3. ¿Ya está prestado según su estado?
    if item.estado_admin == "Prestado":
        raise ValidationError("Este ítem ya está prestado actualmente.")

    # 4. ¿Está dañado?
    if item.estado_fisico == "Dañado":
        raise ValidationError("Este ítem está dañado y no puede prestarse.")

    # ------------------------------
    # Datos del prestatario
    # ------------------------------
    nombre_persona = data.get("nombre_persona")
    cedula = data.get("cedula")
    telefono = data.get("telefono")
    correo = data.get("correo")
    direccion = data.get("direccion")
    fecha_limite = data.get("fecha_limite")

    # ------------------------------
    # Validaciones generales
    # ------------------------------
    if not nombre_persona:
        raise ValidationError("El nombre de la persona es obligatorio.")

    if not cedula:
        raise ValidationError("La cédula es obligatoria.")

    if not telefono:
        raise ValidationError("El teléfono es obligatorio.")

    if not correo:
        raise ValidationError("El correo es obligatorio.")

    # Si no viene fecha_limite, usar la por defecto
    if not fecha_limite:
        fecha_limite_dt = calcular_fecha_limite_default()
    else:
        # ---- Validar fecha límite ----
        try:
            fecha_limite_dt = timezone.datetime.fromisoformat(fecha_limite)
        except (ValueError, TypeError) as e:
            raise ValidationError(f"La fecha límite no tiene un formato válido (ISOFormat requerido): {str(e)}")

        if fecha_limite_dt < timezone.now():
            raise ValidationError("La fecha límite debe ser futura.")

    # ---- Validar correo electrónico ----
    try:
        validate_email(correo)
    except DjangoValidationError:
        raise ValidationError("El correo electrónico no tiene un formato válido.")

    # ------------------------------
    # CREAR EL PRÉSTAMO (Transacción atómica)
    # ------------------------------
    with transaction.atomic():
        prestamo = Prestamo.objects.create(
            item=item,
            nombre_persona=nombre_persona,
            cedula=cedula,
            telefono=telefono,
            correo=correo,
            direccion=direccion,
            fecha_limite=fecha_limite_dt
        )

        # Actualizar estado del item
        item.estado_admin = "Prestado"
        item.save()

    return prestamo


def registrar_devolucion(prestamo: Prestamo):
    if prestamo.estado == "Devuelto":
        raise ValidationError("Este préstamo ya está devuelto.")

    # Marcar devuelto (Transacción atómica)
    with transaction.atomic():
        prestamo.estado = "Devuelto"
        prestamo.fecha_devolucion = timezone.now()
        prestamo.save()

        # Actualizar item
        item = prestamo.item
        item.estado_admin = "Disponible"
        item.save()

    return prestamo
