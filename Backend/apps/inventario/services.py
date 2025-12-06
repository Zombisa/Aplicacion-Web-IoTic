from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from rest_framework.exceptions import ValidationError
from .models import Inventario, Prestamo
from django.conf import settings
from datetime import timedelta


def calcular_fecha_limite_default():
    """
    Calcula la fecha límite por defecto para un préstamo.
    
    Returns:
        datetime: Fecha actual + 7 días
        
    Ejemplo:
        >>> fecha_limite = calcular_fecha_limite_default()
        >>> # fecha_limite será la fecha de hoy a las 7 días
    """
    return timezone.now() + timedelta(days=7)

def crear_items_masivo(data):
    """
    Crea uno o varios ítems de inventario de forma masiva.
    
    Soporta dos modos de operación:
    
    1. MODO OBJETO ÚNICO CON CANTIDAD:
       Recibe un objeto con 'cantidad' y crea ese número de ítems.
       Si 'imagenes' viene como lista, asigna diferentes imágenes a cada ítem.
       
    2. MODO LISTA:
       Recibe una lista completa de ítems a crear.
    
    Args:
        data (dict|list): Datos de los ítems a crear
        
    Returns:
        list: Lista de objetos Inventario creados
        
    Raises:
        ValidationError: Si hay errores en los datos (campos faltantes, 
                        valores inválidos, estados no permitidos, etc.)
                        
    Validaciones realizadas:
        - cantidad debe ser >= 1
        - Todos los ítems deben tener 'descripcion'
        - estado_fisico debe ser uno de: Excelente, Bueno, Dañado
        - estado_admin debe ser uno de: Disponible, Prestado, No prestar
        - Las imágenes deben coincidir con la cantidad si se especifican
        
    Ejemplos:
        # Crear 3 ítems iguales
        items = crear_items_masivo({
            'cantidad': 3,
            'descripcion': 'Laptop',
            'estado_fisico': 'Excelente'
        })
        
        # Crear 3 ítems con imágenes diferentes
        items = crear_items_masivo({
            'cantidad': 3,
            'descripcion': 'Mouse',
            'imagenes': ['image1.jpg', 'image2.jpg', 'image3.jpg']
        })
        
        # Crear desde una lista completa
        items = crear_items_masivo([
            {'descripcion': 'Item1', 'estado_fisico': 'Bueno'},
            {'descripcion': 'Item2', 'estado_fisico': 'Excelente'}
        ])
    """

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
    """
    Registra un nuevo préstamo de un ítem del inventario.
    
    Realiza validaciones exhaustivas:
    - El ítem existe y es válido
    - El ítem no tiene préstamos activos
    - El ítem no está marcado como "No prestar"
    - El ítem no está dañado
    - Los datos del prestatario son válidos (nombre, cédula, teléfono, correo, dirección)
    - La fecha límite es válida (futura y no más de 1 año en el futuro)
    - El correo tiene formato válido
    
    Actualiza automáticamente el estado del ítem a "Prestado" en transacción atómica.
    
    Args:
        data (dict): Diccionario con los siguientes campos:
            - item (Inventario): Objeto del ítem a prestar
            - nombre_persona (str): Nombre del prestatario (obligatorio)
            - cedula (str): Cédula de identidad (obligatorio)
            - telefono (str): Teléfono de contacto (obligatorio)
            - correo (str): Email del prestatario (obligatorio)
            - direccion (str): Dirección del prestatario (obligatorio)
            - fecha_limite (str|None): Fecha límite en formato ISO (opcional, default +7 días)
            
    Returns:
        Prestamo: Objeto del préstamo creado
        
    Raises:
        ValidationError: Si hay errores en validación (ítem no válido, 
                        ya tiene préstamo activo, datos inválidos, etc.)
                        
    Ejemplo:
        prestamo = registrar_prestamo({
            'item': inventario_obj,
            'nombre_persona': 'Juan Pérez',
            'cedula': '1234567890',
            'telefono': '+58412-1234567',
            'correo': 'juan@example.com',
            'direccion': 'Calle 1, Apto 2',
            'fecha_limite': '2025-12-25T18:00:00'
        })
    """

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

        ahora = timezone.now()
        
        if fecha_limite_dt <= ahora:
            raise ValidationError("La fecha límite debe ser futura.")
        
        # Validar que no sea demasiado lejana (máximo 1 año)
        fecha_maxima = ahora + timedelta(days=365)
        if fecha_limite_dt > fecha_maxima:
            raise ValidationError("La fecha límite no puede ser mayor a 1 año en el futuro.")    # ---- Validar correo electrónico ----
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
    """
    Registra la devolución de un ítem prestado.
    
    Marca el préstamo como "Devuelto" y actualiza la fecha de devolución
    a la fecha/hora actual. Cambia el estado del ítem a "Disponible" en
    transacción atómica.
    
    Args:
        prestamo (Prestamo): Objeto del préstamo a devolver
        
    Returns:
        Prestamo: Objeto del préstamo actualizado
        
    Raises:
        ValidationError: Si el préstamo ya está marcado como devuelto
        
    Ejemplo:
        prestamo = registrar_devolucion(prestamo_obj)
        # Ahora prestamo.estado == 'Devuelto'
        # prestamo.fecha_devolucion contiene la fecha/hora actual
        # prestamo.item.estado_admin == 'Disponible'
    """
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
