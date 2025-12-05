from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.utils import timezone
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
    #   AGREGAR ITEM
    # ======================================================
    @method_decorator(verificar_roles(['admin', 'mentor']), name='agregar_item')
    @action(detail=False, methods=['post'], url_path='agregar_item')
    def agregar_item(self, request):
        data = request.data.copy()

        file_path = data.pop("file_path", None)
        if file_path:
            full_url = f"{settings.R2_BUCKET_PATH}/{file_path}"
            data["image_r2"] = full_url

        serializer = InventarioSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)
    
    # ======================================================
    #   REGISTRO MASIVO
    # ======================================================
    @method_decorator(verificar_roles(['admin']), name='crear_masivo')
    @action(detail=False, methods=['post'], url_path='masivo')
    def crear_masivo(self, request):
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
    #   EDITAR ITEM
    # ======================================================
    @method_decorator(verificar_roles(['admin', 'mentor']), name='editar_item')
    @action(detail=True, methods=['put'], url_path='editar_item')
    def editar_item(self, request, pk=None):
        item = get_object_or_404(Inventario, pk=pk)

        serializer = InventarioSerializer(item, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    # ======================================================
    #   ELIMINAR ITEM
    # ======================================================
    @method_decorator(verificar_roles(['admin']), name='eliminar_item')
    @action(detail=True, methods=['delete'], url_path='eliminar_item')
    def eliminar_item(self, request, pk=None):
        item = get_object_or_404(Inventario, pk=pk)

        if item.prestamos.exists():
            return Response(
                {"error": "No se puede eliminar un ítem con préstamos asociados."},
                status=400
            )

        item.delete()
        return Response({"message": "Ítem eliminado correctamente"}, status=204)

    # ======================================================
    #   LISTAR ITEMS
    # ======================================================
    @method_decorator(verificar_roles(['admin', 'mentor']), name='listar_items')
    @action(detail=False, methods=['get'], url_path='listar_items')
    def listar_items(self, request):
        items = Inventario.objects.all().order_by('-id')
        return Response(InventarioSerializer(items, many=True).data)

    # ======================================================
    #   ELIMINAR IMAGEN EN R2
    # ======================================================
    @method_decorator(verificar_roles(['admin', 'mentor']), name='eliminar_imagen')
    @action(detail=True, methods=['delete'], url_path='eliminar-imagen')
    def eliminar_imagen(self, request, pk=None):
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
    @method_decorator(verificar_roles(['admin', 'mentor']), name='listar_imagenes')
    @action(detail=False, methods=['get'], url_path='listar-imagenes')
    def listar_imagenes(self, request):
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
    @method_decorator(verificar_roles(['admin', 'mentor']), name='disponibles')
    @action(detail=False, methods=['get'], url_path='reportes/disponibles')
    def disponibles(self, request):
        qs = Inventario.objects.filter(estado_admin='Disponible')
        return Response(InventarioSerializer(qs, many=True).data)


    @method_decorator(verificar_roles(['admin', 'mentor']), name='prestados')
    @action(detail=False, methods=['get'], url_path='reportes/prestados')
    def prestados(self, request):
        qs = Inventario.objects.filter(estado_admin='Prestado')
        return Response(InventarioSerializer(qs, many=True).data)


    @method_decorator(verificar_roles(['admin', 'mentor']), name='no_prestar')
    @action(detail=False, methods=['get'], url_path='reportes/no-prestar')
    def no_prestar(self, request):
        qs = Inventario.objects.filter(estado_admin='No prestar')
        return Response(InventarioSerializer(qs, many=True).data)

    # ======================================================
    #   DAR BAJA
    # ======================================================
    @method_decorator(verificar_roles(['admin']), name='dar_baja')
    @action(detail=True, methods=['patch'], url_path='dar-baja')
    def dar_baja(self, request, pk=None):

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
    @method_decorator(verificar_roles(['admin', 'mentor']), name='prestamos_por_item')
    @action(detail=True, methods=['get'], url_path='prestamos')
    def prestamos_por_item(self, request, pk=None):
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
    @method_decorator(verificar_roles(['admin', 'mentor']), name='prestamos_vencidos')
    @action(detail=True, methods=['get'], url_path='prestamos/vencidos')
    def prestamos_vencidos(self, request, pk=None):
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
    queryset = Prestamo.objects.all().order_by('-fecha_prestamo')
    serializer_class = PrestamoSerializer

    # ======================================================
    #   CREAR PRÉSTAMO (con foto de entrega opcional)
    # ======================================================
    @method_decorator(verificar_roles(['admin', 'mentor']), name='crear_prestamo')
    @action(detail=False, methods=['post'], url_path='crear')
    def crear_prestamo(self, request):
        data = request.data.copy()

        # validar item
        item_id = data.get('item_id')
        if not item_id:
            return Response({"error": "item_id es requerido"}, status=400)

        item = get_object_or_404(Inventario, pk=item_id)
        data['item'] = item

        # -------------- FOTO ENTREGA (opcional) --------------
        file_path_entrega = data.pop("file_path_entrega", None)
        foto_entrega_url = None
        if file_path_entrega:
            foto_entrega_url = f"{settings.R2_BUCKET_PATH}/{file_path_entrega}"

        # registrar préstamo
        try:
            prestamo = registrar_prestamo(data)
            
            # Asignar foto de entrega después de crear el préstamo
            if foto_entrega_url:
                prestamo.foto_entrega = foto_entrega_url
                prestamo.save()
            
            return Response(PrestamoSerializer(prestamo).data, status=201)
        except ValidationError as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            return Response({"error": f"Error inesperado: {str(e)}"}, status=500)

    # ======================================================
    #   DEVOLVER ÍTEM (con foto de devolución opcional)
    # ======================================================
    @method_decorator(verificar_roles(['admin', 'mentor']), name='devolver')
    @action(detail=True, methods=['post'], url_path='devolver')
    def devolver(self, request, pk=None):
        prestamo = get_object_or_404(Prestamo, pk=pk)
        data = request.data.copy()

        # -------------- FOTO DEVOLUCIÓN (opcional) --------------
        file_path_devolucion = data.pop("file_path_devolucion", None)
        if file_path_devolucion:
            full_url = f"{settings.R2_BUCKET_PATH}/{file_path_devolucion}"
            prestamo.foto_devolucion = full_url
            prestamo.save()

        # registrar devolución lógica
        try:
            prestamo = registrar_devolucion(prestamo)
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
    #   ELIMINAR FOTO ENTREGA
    # ======================================================
    @method_decorator(verificar_roles(['admin', 'mentor']), name='eliminar_foto_entrega')
    @action(detail=True, methods=['delete'], url_path='eliminar-foto-entrega')
    def eliminar_foto_entrega(self, request, pk=None):
        prestamo = get_object_or_404(Prestamo, pk=pk)

        if not prestamo.foto_entrega:
            return Response({"error": "No existe foto de entrega"}, status=400)

        filename = prestamo.foto_entrega.split("/")[-1]

        try:
            s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=filename)
        except Exception as e:
            return Response({"error": f"No se pudo eliminar la foto: {str(e)}"}, status=500)

        prestamo.foto_entrega = None
        prestamo.save()

        return Response({"message": "Foto de entrega eliminada correctamente"}, status=200)

    # ======================================================
    #   ELIMINAR FOTO DEVOLUCIÓN
    # ======================================================
    @method_decorator(verificar_roles(['admin', 'mentor']), name='eliminar_foto_devolucion')
    @action(detail=True, methods=['delete'], url_path='eliminar-foto-devolucion')
    def eliminar_foto_devolucion(self, request, pk=None):
        prestamo = get_object_or_404(Prestamo, pk=pk)

        if not prestamo.foto_devolucion:
            return Response({"error": "No existe foto de devolución"}, status=400)

        filename = prestamo.foto_devolucion.split("/")[-1]

        try:
            s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=filename)
        except Exception as e:
            return Response({"error": f"No se pudo eliminar la foto: {str(e)}"}, status=500)

        prestamo.foto_devolucion = None
        prestamo.save()

        return Response({"message": "Foto de devolución eliminada correctamente"}, status=200)

    # ======================================================
    #   REPORTES
    # ======================================================
    @method_decorator(verificar_roles(['admin', 'mentor']), name='activos')
    @action(detail=False, methods=['get'], url_path='activos')
    def activos(self, request):
        prestamos = Prestamo.objects.filter(estado='Prestado')
        return Response(PrestamoSerializer(prestamos, many=True).data)

    @method_decorator(verificar_roles(['admin', 'mentor']), name='devueltos')
    @action(detail=False, methods=['get'], url_path='devueltos')
    def devueltos(self, request):
        prestamos = Prestamo.objects.filter(estado='Devuelto')
        return Response(PrestamoSerializer(prestamos, many=True).data)

    @method_decorator(verificar_roles(['admin', 'mentor']), name='historico')
    @action(detail=False, methods=['get'], url_path='historico')
    def historico(self, request):
        prestamos = Prestamo.objects.all().order_by('-fecha_prestamo')
        return Response(PrestamoSerializer(prestamos, many=True).data)

    @method_decorator(verificar_roles(['admin', 'mentor']), name='vencidos')
    @action(detail=False, methods=['get'], url_path='vencidos')
    def vencidos(self, request):
        hoy = timezone.now()

        prestamos_vencidos = Prestamo.objects.filter(
            estado="Prestado",
            fecha_limite__lt=hoy
        ).order_by('-fecha_limite')

        return Response(PrestamoSerializer(prestamos_vencidos, many=True).data)

    @method_decorator(verificar_roles(['admin', 'mentor']), name='por_vencer')
    @action(detail=False, methods=['get'], url_path='por-vencer')
    def por_vencer(self, request):
        hoy = timezone.now()
        limite = hoy + timedelta(hours=48)

        prestamos = Prestamo.objects.filter(
            estado="Prestado",
            fecha_limite__gte=hoy,
            fecha_limite__lte=limite
        ).order_by("fecha_limite")

        return Response(PrestamoSerializer(prestamos, many=True).data)