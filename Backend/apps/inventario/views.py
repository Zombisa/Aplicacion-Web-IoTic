from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.db import IntegrityError
from datetime import timedelta
from django.conf import settings
from backend.serviceCloudflare.R2Client import s3

from .models import Inventario, Prestamo
from .serializers import InventarioSerializer, PrestamoSerializer
from .services import crear_items_masivo, registrar_prestamo, registrar_devolucion
from .decorators import verificar_token, verificar_roles

from apps.usuarios_roles.models import Usuario


# ==========================================================================
#   INVENTARIO VIEWSET
# ==========================================================================

@method_decorator(verificar_token, name='dispatch')
class InventarioViewSet(viewsets.ModelViewSet):
    queryset = Inventario.objects.all().order_by('-id')
    serializer_class = InventarioSerializer

    # ======================================================
    #   CREAR ITEM (CREATE)
    # ======================================================
    # Sobrescribimos el método create de ModelViewSet
    @method_decorator(verificar_roles(['admin']), name='create')
    def create(self, request):
        """
        Crea un nuevo ítem de inventario.
        
        Roles permitidos: admin únicamente
        
        Request body esperado:
            {
                "descripcion": "str (obligatorio)",
                "estado_fisico": "str (Excelente|Bueno|Dañado)",
                "estado_admin": "str (Disponible|Prestado|No prestar)",
                "observacion": "str (opcional)",
                "file_path": "str (opcional, ruta en R2)"
            }
        
        Returns:
            201 Created: Objeto Inventario creado
            400 Bad Request: Errores de validación o serial duplicado
            
        Errores comunes:
            - Serial duplicado: "El serial ya existe. Debe ser único."
            - Descripción vacía: "La descripción no puede estar vacía."
            - Estado inválido: "estado_fisico debe ser uno de: [...] "
        """
        data = request.data.copy()

        file_path = data.pop("file_path", None)
        if file_path:
            full_url = f"{settings.R2_BUCKET_PATH}/{file_path}"
            data["image_r2"] = full_url

        serializer = InventarioSerializer(data=data)

        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=201)
            except IntegrityError as e:
                if 'serial' in str(e):
                    return Response(
                        {"error": "El serial ya existe. Debe ser único."},
                        status=400
                    )
                return Response(
                    {"error": f"Error de integridad: {str(e)}"},
                    status=400
                )

        return Response(serializer.errors, status=400)
    
    # ======================================================
    #   REGISTRO MASIVO
    # ======================================================
    @method_decorator(verificar_roles(['admin']), name='bulk')
    @action(detail=False, methods=['post'], url_path='bulk')
    def bulk(self, request):
        """
        Crea múltiples ítems de inventario en una sola operación.
        
        Roles permitidos: admin únicamente
        
        Soporta dos modos:
        
        MODO 1 - Objeto con cantidad:
            {
                "cantidad": 3,
                "descripcion": "str",
                "estado_fisico": "str",
                "estado_admin": "str",
                "image_r2": "str (opcional, URL completa única)",
                "imagenes_r2": ["url1", "url2", "url3"] (opcional, URLs completas, una por ítem),
                "imagenes": ["img1.jpg", "img2.jpg", "img3.jpg"] (opcional, solo nombres/paths, se componen URLs)
            }
        
        MODO 2 - Lista completa:
            [
                {"descripcion": "Item1", "estado_fisico": "Excelente", ...},
                {"descripcion": "Item2", "estado_fisico": "Bueno", ...}
            ]
        
        Returns:
            201 Created: {"message": "X ítems creados", "items": [...]}
            400 Bad Request: Errores de validación (cantidad, imágenes, etc.)
            500 Internal Server Error: Errores inesperados
            
        Validaciones:
            - cantidad >= 1
            - Si imagenes está presente, debe coincidir con cantidad
            - No se puede usar file_path único cuando cantidad > 1
        """
        try:
            data = request.data

            # ─────────────────────────────────────────────
            # CASO MODO LISTA
            # ─────────────────────────────────────────────
            if "items" in data:
                items_list = data["items"]

                if not isinstance(items_list, list):
                    return Response(
                        {"error": "'items' debe ser una lista de ítems"},
                        status=400
                    )

                creados = crear_items_masivo(items_list)

                return Response({
                    "message": f"{len(creados)} ítems creados correctamente.",
                    "items": InventarioSerializer(creados, many=True).data
                }, status=201)

            # ─────────────────────────────────────────────
            # CASO MODO OBJETO ÚNICO
            # ─────────────────────────────────────────────
            creados = crear_items_masivo(data)

            return Response({
                "message": f"{len(creados)} ítems creados correctamente.",
                "items": InventarioSerializer(creados, many=True).data
            }, status=201)

        except ValidationError as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            return Response({"error": f"Error inesperado: {str(e)}"}, status=500)



    # ======================================================
    #   ACTUALIZAR ITEM (UPDATE)
    # ======================================================
    # Sobrescribimos el método update de ModelViewSet
    @method_decorator(verificar_roles(['admin']), name='update')
    def update(self, request, pk=None):
        """
        Edita un ítem de inventario existente.
        
        Roles permitidos: admin únicamente
        
        URL: /inventario/{id}/  [PUT]
        
        Request body (todos los campos son opcionales):
            {
                "descripcion": "str",
                "estado_fisico": "str",
                "estado_admin": "str",
                "observacion": "str",
                "image_r2": "str (URL completa de la imagen)"
            }
        
        Comportamiento con imágenes:
            - Si se envía una nueva URL de imagen y el ítem ya tenía una imagen diferente,
              se verificará si la imagen anterior está siendo usada por:
              * Otros ítems activos en el inventario
              * Snapshots en el histórico de préstamos
            - Solo se eliminará de Cloudflare R2 si NO está siendo usada en ningún lugar
            - Esto previene pérdida de datos del histórico y permite compartir imágenes
        
        Returns:
            200 OK: Objeto Inventario actualizado
            404 Not Found: Ítem no existe
            400 Bad Request: Errores de validación
        """
        item = get_object_or_404(Inventario, pk=pk)

        # Procesar file_path si viene (componer URL con bucket)
        data = request.data.copy()
        file_path = data.pop('file_path', None)
        if file_path and not data.get('image_r2'):
            data['image_r2'] = f"{settings.R2_BUCKET_PATH}/{file_path}"

        # Si viene una nueva imagen y ya tenía una diferente, verificar antes de eliminar
        nueva_imagen = data.get('image_r2')
        if nueva_imagen and item.image_r2 and nueva_imagen != item.image_r2:
            imagen_anterior = item.image_r2
            
            # Verificar si otros items activos usan la misma imagen
            items_con_misma_imagen = Inventario.objects.filter(
                image_r2=imagen_anterior
            ).count()
            
            # Verificar si existe en snapshots del histórico de préstamos
            prestamos_con_imagen = Prestamo.objects.filter(
                item_image_r2_snapshot=imagen_anterior
            ).exists()
            
            # Solo eliminar si es el ÚNICO item usando esa imagen Y no está en histórico
            if items_con_misma_imagen == 1 and not prestamos_con_imagen:
                filename = imagen_anterior.split("/")[-1]
                try:
                    s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=filename)
                except Exception as e:
                    # Log del error pero continuar con la actualización
                    print(f"Error eliminando imagen anterior de R2: {str(e)}")
            # Si items_con_misma_imagen > 1 o prestamos_con_imagen == True, no eliminar

        serializer = InventarioSerializer(item, data=data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    # ======================================================
    #   ELIMINAR ITEM (DELETE)
    # ======================================================
    # Sobrescribimos el método destroy de ModelViewSet
    @method_decorator(verificar_roles(['admin']), name='destroy')
    def destroy(self, request, pk=None):
        """
        Elimina un ítem del inventario.
        
        Roles permitidos: admin únicamente
        
        URL: /inventario/{id}/
        
        Restricciones:
            - No se puede eliminar si tiene préstamos ACTIVOS (estado="Prestado")
            - SÍ se puede eliminar si tiene préstamos DEVUELTOS (estado="Devuelto")
              porque los snapshots del histórico conservan toda la información
            - Protege la integridad referencial de préstamos en curso
        
        Returns:
            204 No Content: Eliminación exitosa
            400 Bad Request: "No se puede eliminar un ítem con préstamos activos."
            404 Not Found: Ítem no existe
        """
        item = get_object_or_404(Inventario, pk=pk)

        # Solo bloquear si hay préstamos ACTIVOS (no devueltos)
        if item.prestamos.filter(estado="Prestado").exists():
            return Response(
                {"error": "No se puede eliminar un ítem con préstamos activos."},
                status=400
            )

        # Antes de eliminar, verificar si la imagen se puede eliminar de R2
        imagen_a_eliminar = item.image_r2
        
        if imagen_a_eliminar:
            # Verificar si otros items activos usan la misma imagen
            items_con_misma_imagen = Inventario.objects.filter(
                image_r2=imagen_a_eliminar
            ).exclude(pk=pk).count()
            
            # Verificar si existe en snapshots del histórico de préstamos
            prestamos_con_imagen = Prestamo.objects.filter(
                item_image_r2_snapshot=imagen_a_eliminar
            ).exists()
            
            # Solo eliminar si es el ÚNICO item usando esa imagen Y no está en histórico
            if items_con_misma_imagen == 0 and not prestamos_con_imagen:
                filename = imagen_a_eliminar.split("/")[-1]
                try:
                    s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=filename)
                except Exception as e:
                    # Log del error pero continuar con la eliminación del item
                    print(f"Error eliminando imagen de R2: {str(e)}")

        item.delete()
        return Response({"message": "Ítem eliminado correctamente"}, status=204)

    # ======================================================
    #   LISTAR ITEMS (LIST)
    # ======================================================
    # Sobrescribimos el método list de ModelViewSet
    @method_decorator(verificar_roles(['admin']), name='list')
    def list(self, request):
        """
        Lista todos los ítems del inventario.
        
        Roles permitidos: admin únicamente
        
        URL: /inventario/
        
        Returns:
            200 OK: Lista de objetos Inventario ordenados por ID descendente
            
        Estructura de respuesta:
            [
                {
                    "id": 1,
                    "serial": "ITM-00001",
                    "descripcion": "str",
                    "estado_fisico": "str",
                    "estado_admin": "str",
                    "fecha_registro": "ISO datetime",
                    "observacion": "str",
                    "image_r2": "str"
                },
                ...
            ]
        """
        items = Inventario.objects.all().order_by('-id')
        return Response(InventarioSerializer(items, many=True).data)

    # ======================================================
    #   DETALLE ITEM (RETRIEVE)
    # ======================================================
    @method_decorator(verificar_roles(['admin']), name='retrieve')
    def retrieve(self, request, *args, **kwargs):
        """Detalle de ítem solo visible para administradores."""
        return super().retrieve(request, *args, **kwargs)

    # ======================================================
    #   ELIMINAR IMAGEN EN R2
    # ======================================================
    @method_decorator(verificar_roles(['admin']), name='image')
    @action(detail=True, methods=['delete'], url_path='image')
    def image(self, request, pk=None):
        """
        Elimina la imagen asociada a un ítem del bucket R2 (Cloudflare).
        
        Roles permitidos: admin únicamente
        
        URL: /inventario/{id}/image/
        
        Comportamiento:
            - Extrae el nombre del archivo de la URL almacenada
            - Elimina el archivo del bucket R2
            - Limpia el campo image_r2 del ítem
        
        Returns:
            200 OK: {"message": "Imagen eliminada correctamente"}
            400 Bad Request: "El ítem no tiene imagen"
            404 Not Found: Ítem no existe
            500 Internal Server Error: Error al eliminar en R2
        """
        item = get_object_or_404(Inventario, pk=pk)

        if not item.image_r2:
            return Response({'message': 'El ítem no tiene imagen'}, status=400)

        filename = item.image_r2.split("/")[-1]

        try:
            s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=filename)
        except Exception as e:
            return Response(
                {"error": f"Error eliminando imagen en R2: {str(e)}"},
                status=500
            )

        item.image_r2 = None
        item.save()

        return Response({'message': 'Imagen eliminada correctamente'}, status=200)

    # ======================================================
    #   LISTAR IMÁGENES DEL BUCKET
    # ======================================================
    @method_decorator(verificar_roles(['admin']), name='images')
    @action(detail=False, methods=['get'], url_path='images')
    def images(self, request):
        """
        Lista todas las imágenes disponibles en el bucket R2 (Cloudflare).
        
        Roles permitidos: admin únicamente
        
        URL: /inventario/images/
        
        Útil para:
            - Ver qué imágenes están disponibles en el bucket
            - Seleccionar imágenes para asignar a ítems
            - Auditoría de archivos subidos
        
        Returns:
            200 OK: Lista de URLs completas de imágenes
                [
                    "https://bucket.r2.../archivo1.jpg",
                    "https://bucket.r2.../archivo2.jpg",
                    ...
                ]
            500 Internal Server Error: Error al conectar con R2
        """
        try:
            response = s3.list_objects_v2(Bucket=settings.R2_BUCKET_NAME)
            archivos = [obj['Key'] for obj in response.get('Contents', [])]
            urls = [f"{settings.R2_BUCKET_PATH}/{key}" for key in archivos]
            return Response(urls)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    # ======================================================
    #   REPORTES 
    # ======================================================
    @method_decorator(verificar_roles(['admin']), name='disponibles')
    @action(detail=False, methods=['get'], url_path='reports/available')
    def disponibles(self, request):
        """
        Reporte: Lista todos los ítems disponibles para prestar.
        
        Roles permitidos: admin únicamente
        
        URL: /inventario/reports/available/
        
        Filtro: estado_admin == 'Disponible'
        
        Returns:
            200 OK: Lista de objetos Inventario disponibles
        """
        qs = Inventario.objects.filter(estado_admin='Disponible')
        return Response(InventarioSerializer(qs, many=True).data)


    @method_decorator(verificar_roles(['admin']), name='prestados')
    @action(detail=False, methods=['get'], url_path='reports/loaned')
    def prestados(self, request):
        """
        Reporte: Lista todos los ítems actualmente prestados.
        
        Roles permitidos: admin únicamente
        
        URL: /inventario/reports/loaned/
        
        Filtro: estado_admin == 'Prestado'
        
        Returns:
            200 OK: Lista de objetos Inventario en estado Prestado
        """
        qs = Inventario.objects.filter(estado_admin='Prestado')
        return Response(InventarioSerializer(qs, many=True).data)


    @method_decorator(verificar_roles(['admin']), name='no_prestar')
    @action(detail=False, methods=['get'], url_path='reports/not-loanable')
    def no_prestar(self, request):
        """
        Reporte: Lista todos los ítems marcados como "No prestar".
        
        Roles permitidos: admin únicamente
        
        URL: /inventario/reports/not-loanable/
        
        Filtro: estado_admin == 'No prestar'
        
        Casos comunes:
            - Ítems dañados que se dieron de baja
            - Ítems que están siendo reparados
            - Ítems que requieren mantenimiento especial
        
        Returns:
            200 OK: Lista de objetos Inventario no disponibles para prestar
        """
        qs = Inventario.objects.filter(estado_admin='No prestar')
        return Response(InventarioSerializer(qs, many=True).data)

    # ======================================================
    #   DAR BAJA (PATCH)
    # ======================================================
    @method_decorator(verificar_roles(['admin']), name='partial_update')
    def partial_update(self, request, pk=None):
        """
        Da de baja un ítem marcándolo como dañado y no disponible.
        
        Roles permitidos: admin únicamente
        
        URL: /inventario/{id}/  [PATCH]
        
        Cambios realizados:
            - estado_fisico = 'Dañado'
            - estado_admin = 'No prestar'
        
        Idempotente:
            - Si ya está dado de baja, devuelve mensaje de éxito
        
        Returns:
            200 OK: {"message": "Ítem dado de baja correctamente.", "item": {...}}
            404 Not Found: Ítem no existe
        """

        item = get_object_or_404(Inventario, pk=pk)

        if item.estado_fisico == "Dañado":
            return Response({'message': 'El ítem ya estaba dado de baja'})

        item.estado_fisico = "Dañado"
        item.estado_admin = "No prestar"
        item.save()

        return Response({
            "message": "Ítem dado de baja correctamente.",
            "item": InventarioSerializer(item).data
        })

    # ======================================================
    #   PRÉSTAMOS
    # ======================================================
    @method_decorator(verificar_roles(['admin']), name='loans')
    @action(detail=True, methods=['get'], url_path='loans')
    def loans(self, request, pk=None):
        """
        Lista todos los préstamos asociados a un ítem específico.
        
        Roles permitidos: admin únicamente
        
        URL: /inventario/{id}/loans/
        
        Query parameters (opcionales):
            - estado: Filtrar por estado ('Prestado' o 'Devuelto')
            - activo: Si es 'true', muestra solo préstamos en estado 'Prestado'
        
        Ejemplos:
            /inventario/1/loans/?estado=Prestado
            /inventario/1/loans/?activo=true
        
        Returns:
            200 OK: Lista de objetos Prestamo del ítem
            404 Not Found: Ítem no existe
        """
        item = get_object_or_404(Inventario, pk=pk)
        prestamos = item.prestamos.all()

        estado = request.query_params.get('estado')
        if estado:
            estado = estado.capitalize()
            if estado in ['Prestado', 'Devuelto']:
                prestamos = prestamos.filter(estado=estado)

        activo = request.query_params.get('activo')
        if activo and activo.lower() == 'true':
            prestamos = prestamos.filter(estado='Prestado')

        return Response(PrestamoSerializer(prestamos, many=True).data)

    # ======================================================
    #   PRÉSTAMOS VENCIDOS
    # ======================================================
    @method_decorator(verificar_roles(['admin']), name='overdue_loans')
    @action(detail=True, methods=['get'], url_path='loans/overdue')
    def overdue_loans(self, request, pk=None):
        """
        Lista los préstamos vencidos (no devueltos a tiempo) de un ítem.
        
        Roles permitidos: admin únicamente
        
        URL: /inventario/{id}/loans/overdue/
        
        Filtros automáticos:
            - estado == 'Prestado' (aún no devuelto)
            - fecha_limite < ahora (pasó la fecha límite)
        
        Ordenamiento: Por fecha_limite descendente (más vencidos primero)
        
        Returns:
            200 OK: Lista de préstamos vencidos ordenados
            404 Not Found: Ítem no existe
        """
        item = get_object_or_404(Inventario, pk=pk)
        hoy = timezone.now()

        vencidos = item.prestamos.filter(
            estado="Prestado",
            fecha_limite__lt=hoy
        ).order_by('-fecha_limite')

        return Response(PrestamoSerializer(vencidos, many=True).data)

# ======================================================
#  PRESTAMO VIEWSET
# ======================================================

@method_decorator(verificar_token, name='dispatch')
class PrestamoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar préstamos de ítems del inventario.
    
    Proporciona operaciones para:
    - Crear nuevos préstamos (con validaciones exhaustivas)
    - Devolver ítems prestados
    - Gestionar fotos de entrega/devolución en R2
    - Consultar préstamos por diferentes filtros
    - Reportes de préstamos activos, vencidos, por vencer

    Permisos:
        - Requiere token de autenticación
        - admin: acceso completo
    
    Atributos:
        queryset: Todos los préstamos ordenados por fecha descendente
        serializer_class: PrestamoSerializer para validación
    
    Validaciones principales:
        - El ítem debe existir y estar disponible
        - El ítem no debe tener préstamos activos
        - El ítem no debe estar dañado
        - Datos del prestatario son obligatorios y validados
        - Fecha límite debe ser futura
    """

    queryset = Prestamo.objects.all().order_by('-id')
    serializer_class = PrestamoSerializer

    # ======================================================
    #   LISTAR / DETALLE / UPDATE (ADMIN)
    # ======================================================
    @method_decorator(verificar_roles(['admin']), name='list')
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @method_decorator(verificar_roles(['admin']), name='retrieve')
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @method_decorator(verificar_roles(['admin']), name='update')
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    # ======================================================
    #   CREAR PRÉSTAMO (CREATE) - con foto de entrega opcional
    # ======================================================
    # Sobrescribimos el método create de ModelViewSet
    @method_decorator(verificar_roles(['admin']), name='create')
    def create(self, request):
        """
        Crea un nuevo préstamo de un ítem del inventario.
        
        Roles permitidos: admin únicamente
        
        Request body requerido:
            {
                "item_id": 1,
                "nombre_persona": "str (obligatorio)",
                "cedula": "str (obligatorio, debe contener dígitos)",
                "telefono": "str (obligatorio, mín 7 caracteres, debe contener dígitos)",
                "correo": "str (obligatorio, formato email válido)",
                "direccion": "str (obligatorio)",
                "fecha_limite": "YYYY-MM-DDTHH:MM:SS (opcional, default +7 días)",
                "file_path_entrega": "str (opcional, ruta en R2)"
            }
        
        Returns:
            201 Created: Objeto Prestamo creado
            400 Bad Request: Errores de validación o estado del ítem
            404 Not Found: Ítem no existe
            500 Internal Server Error: Error inesperado
            
        Errores de validación comunes:
            - "Este ítem ya tiene un préstamo activo."
            - "Este ítem no está disponible para préstamos."
            - "Este ítem está dañado y no puede prestarse."
            - "El correo electrónico no tiene un formato válido."
            - "La fecha límite debe ser posterior a la fecha actual."
        """
        data = request.data.copy()

        # validar item
        item_id = data.get('item_id')
        if not item_id:
            return Response({"error": "item_id es requerido"}, status=400)

        item = get_object_or_404(Inventario, pk=item_id)
        data['item'] = item

        # registrar préstamo
        try:
            prestamo = registrar_prestamo(data)
            return Response(PrestamoSerializer(prestamo).data, status=201)
        except ValidationError as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            return Response({"error": f"Error inesperado: {str(e)}"}, status=500)

    # ======================================================
    #   DEVOLVER ÍTEM - PATCH
    # ======================================================
    @method_decorator(verificar_roles(['admin']), name='partial_update')
    def partial_update(self, request, pk=None):
        """
        Registra la devolución de un ítem prestado.
        
        Roles permitidos: admin únicamente
        
        URL: /prestamo/{id}/  [PATCH]
        
        Request body (opcional):
            {
                "estado_fisico": "str (Excelente|Bueno|Dañado)"
            }
        
        Cambios realizados:
            - Marca el préstamo como "Devuelto"
            - Asigna fecha_devolucion = ahora
            - Cambia estado del ítem a "Disponible"
            - Si se proporciona estado_fisico, actualiza el estado físico del ítem
        
        Returns:
            200 OK: {"message": "Ítem devuelto correctamente.", "prestamo": {...}}
            400 Bad Request: El préstamo ya está devuelto o estado_fisico inválido
            404 Not Found: Préstamo no existe
            500 Internal Server Error: Error inesperado
            
        Ejemplos:
            # Devolución normal (sin cambio de estado)
            PATCH /prestamo/5/
            {}
            
            # Devolución con ítem dañado
            PATCH /prestamo/5/
            {"estado_fisico": "Dañado"}
            
            # Devolución con menor calidad
            PATCH /prestamo/5/
            {"estado_fisico": "Bueno"}
        """
        prestamo = get_object_or_404(Prestamo, pk=pk)
        data = request.data.copy()

        # Extraer estado_fisico si viene
        nuevo_estado_fisico = data.pop('estado_fisico', None)

        # registrar devolución lógica
        try:
            prestamo = registrar_devolucion(prestamo, nuevo_estado_fisico=nuevo_estado_fisico)
            return Response({
                "message": "Ítem devuelto correctamente.",
                "prestamo": PrestamoSerializer(prestamo).data
            })
        except ValidationError as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            return Response({"error": f"Error inesperado: {str(e)}"}, status=500)

    # ======================================================
    #   ELIMINAR
    # ======================================================
    @method_decorator(verificar_roles(['admin']), name='destroy')
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    # ======================================================
    #   REPORTES
    # ======================================================
    @method_decorator(verificar_roles(['admin']), name='active')
    @action(detail=False, methods=['get'], url_path='active')
    def active(self, request):
        """
        Reporte: Lista todos los préstamos activos (no devueltos).
        
        Roles permitidos: admin únicamente
        
        URL: /prestamo/active/
        
        Filtro: estado == 'Prestado'
        
        Returns:
            200 OK: Lista de objetos Prestamo en estado activo
        """
        prestamos = Prestamo.objects.filter(estado='Prestado')
        return Response(PrestamoSerializer(prestamos, many=True).data)

    @method_decorator(verificar_roles(['admin']), name='returned')
    @action(detail=False, methods=['get'], url_path='returned')
    def returned(self, request):
        """
        Reporte: Lista todos los préstamos completados (devueltos).
        
        Roles permitidos: admin únicamente
        
        URL: /prestamo/returned/
        
        Filtro: estado == 'Devuelto'
        
        Returns:
            200 OK: Lista de objetos Prestamo completados
        """
        prestamos = Prestamo.objects.filter(estado='Devuelto')
        return Response(PrestamoSerializer(prestamos, many=True).data)

    @method_decorator(verificar_roles(['admin']), name='history')
    @action(detail=False, methods=['get'], url_path='history')
    def history(self, request):
        """
        Reporte: Lista el historial completo de todos los préstamos.
        
        Roles permitidos: admin únicamente
        
        URL: /prestamo/history/
        
        Ordenamiento: Por fecha_prestamo descendente (más recientes primero)
        
        Incluye:
            - Préstamos activos
            - Préstamos devueltos
            - Registro completo de todas las operaciones
        
        Returns:
            200 OK: Lista de todos los objetos Prestamo ordenados
        """
        prestamos = Prestamo.objects.all().order_by('-fecha_prestamo')
        return Response(PrestamoSerializer(prestamos, many=True).data)

    @method_decorator(verificar_roles(['admin']), name='overdue')
    @action(detail=False, methods=['get'], url_path='overdue')
    def overdue(self, request):
        """
        Reporte: Lista todos los préstamos que ya pasaron su fecha límite.
        
        Roles permitidos: admin únicamente
        
        URL: /prestamo/overdue/
        
        Filtros automáticos:
            - estado == 'Prestado' (aún no devueltos)
            - fecha_limite < ahora (pasó la fecha límite)
        
        Ordenamiento: Por fecha_limite descendente (más vencidos primero)
        
        Útil para:
            - Identificar préstamos que requieren seguimiento
            - Notificar a usuarios sobre devoluciones pendientes
            - Auditoría de incumplimientos
        
        Returns:
            200 OK: Lista de préstamos vencidos
        """
        hoy = timezone.now()

        prestamos_vencidos = Prestamo.objects.filter(
            estado="Prestado",
            fecha_limite__lt=hoy
        ).order_by('-fecha_limite')

        return Response(PrestamoSerializer(prestamos_vencidos, many=True).data)

    @method_decorator(verificar_roles(['admin']), name='por_vencer')
    @action(detail=False, methods=['get'], url_path='por-vencer')
    def por_vencer(self, request):
        """
        Reporte: Lista préstamos que vencerán próximamente (en las próximas 48 horas).
        
        Roles permitidos: admin únicamente
        
        URL: /prestamo/por-vencer/
        
        Filtros automáticos:
            - estado == 'Prestado' (aún activos)
            - fecha_limite >= ahora (todavía no vencidos)
            - fecha_limite <= ahora + 48 horas (vencerán pronto)
        
        Ordenamiento: Por fecha_limite ascendente (que vencen primero al inicio)
        
        Útil para:
            - Alertas tempranas de devoluciones próximas
            - Notificaciones preventivas a usuarios
            - Planificación de seguimiento
        
        Returns:
            200 OK: Lista de préstamos a punto de vencer
        """
        hoy = timezone.now()
        limite = hoy + timedelta(hours=48)

        prestamos = Prestamo.objects.filter(
            estado="Prestado",
            fecha_limite__gte=hoy,
            fecha_limite__lte=limite
        ).order_by("fecha_limite")

        return Response(PrestamoSerializer(prestamos, many=True).data)