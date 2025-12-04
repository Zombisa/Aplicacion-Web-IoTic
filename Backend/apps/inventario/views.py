from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.conf import settings
from backend.serviceCloudflare.R2Client import s3

from .models import Inventario, Prestamo
from .serializers import InventarioSerializer, PrestamoSerializer
from .services import crear_items_masivo, registrar_prestamo, registrar_devolucion
from .decorators import verificar_token, verificar_roles

from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken


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
    @action(detail=False, methods=['post'], url_path='agregar_item')
    def agregar_item(self, request):

        # validar rol igual a CapLibro
        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Token expirado o inválido.'}, status=403)

        data = request.data.copy()

        # Manejo imagen tipo CapLibro
        file_path = data.pop("file_path", None)
        if file_path:
            full_url = f"{settings.R2_BUCKET_PATH}/{file_path}"
            data["image_r2"] = full_url

        serializer = InventarioSerializer(data=data)

        if serializer.is_valid():
            uid = verificarToken.obtenerUID(request)

            try:
                usuario = Usuario.objects.get(uid_firebase=uid)
            except Usuario.DoesNotExist:
                return Response({'error': 'Usuario no encontrado'}, status=404)

            serializer.save(usuario=usuario)
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

    # ======================================================
    #   EDITAR ITEM
    # ======================================================
    @action(detail=True, methods=['put'], url_path='editar_item')
    def editar_item(self, request, pk=None):

        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Token inválido o expirado'}, status=403)

        item = get_object_or_404(Inventario, pk=pk)

        serializer = InventarioSerializer(item, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    # ======================================================
    #   ELIMINAR ITEM
    # ======================================================
    @action(detail=True, methods=['delete'], url_path='eliminar_item')
    def eliminar_item(self, request, pk=None):

        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Token inválido o expirado'}, status=403)

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
    @action(detail=False, methods=['get'], url_path='listar_items')
    def listar_items(self, request):

        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Token inválido'}, status=403)

        items = Inventario.objects.all().order_by('-id')
        return Response(InventarioSerializer(items, many=True).data)

    # ======================================================
    #   ELIMINAR IMAGEN EN R2
    # ======================================================
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
    @action(detail=False, methods=['get'], url_path='reportes/disponibles')
    def disponibles(self, request):
        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        qs = Inventario.objects.filter(estado_admin='Disponible')
        return Response(InventarioSerializer(qs, many=True).data)


    @action(detail=False, methods=['get'], url_path='reportes/prestados')
    def prestados(self, request):
        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        qs = Inventario.objects.filter(estado_admin='Prestado')
        return Response(InventarioSerializer(qs, many=True).data)


    @action(detail=False, methods=['get'], url_path='reportes/no-prestar')
    def no_prestar(self, request):
        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        qs = Inventario.objects.filter(estado_admin='No prestar')
        return Response(InventarioSerializer(qs, many=True).data)

    # ======================================================
    #   DAR BAJA
    # ======================================================
    @method_decorator(verificar_roles(['admin']))
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
    @action(detail=False, methods=['post'], url_path='crear')
    def crear_prestamo(self, request):

        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        data = request.data.copy()

        # validar item
        item_id = data.get('item_id')
        if not item_id:
            return Response({"error": "item_id es requerido"}, status=400)

        item = get_object_or_404(Inventario, pk=item_id)
        data['item'] = item

        # -------------- FOTO ENTREGA (opcional) --------------
        file_path_entrega = data.pop("file_path_entrega", None)
        if file_path_entrega:
            full_url = f"{settings.R2_BUCKET_PATH}/{file_path_entrega}"
            data["foto_entrega"] = full_url

        # registrar préstamo
        try:
            prestamo = registrar_prestamo(data)
            return Response(PrestamoSerializer(prestamo).data, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

    # ======================================================
    #   DEVOLVER ÍTEM (con foto de devolución opcional)
    # ======================================================
    @action(detail=True, methods=['post'], url_path='devolver')
    def devolver(self, request, pk=None):

        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

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
        except Exception as e:
            return Response({"error": str(e)}, status=400)

    # ======================================================
    #   ELIMINAR
    # ======================================================
    @method_decorator(verificar_roles(["admin"]))
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    # ======================================================
    #   ELIMINAR FOTO ENTREGA
    # ======================================================
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
    @action(detail=False, methods=['get'], url_path='activos')
    def activos(self, request):

        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        prestamos = Prestamo.objects.filter(estado='Prestado')
        return Response(PrestamoSerializer(prestamos, many=True).data)

    @action(detail=False, methods=['get'], url_path='devueltos')
    def devueltos(self, request):

        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        prestamos = Prestamo.objects.filter(estado='Devuelto')
        return Response(PrestamoSerializer(prestamos, many=True).data)

    @action(detail=False, methods=['get'], url_path='historico')
    def historico(self, request):

        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        prestamos = Prestamo.objects.all().order_by('-fecha_prestamo')
        return Response(PrestamoSerializer(prestamos, many=True).data)

    @action(detail=False, methods=['get'], url_path='vencidos')
    def vencidos(self, request):

        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        hoy = timezone.now()

        prestamos_vencidos = Prestamo.objects.filter(
            estado="Prestado",
            fecha_limite__lt=hoy
        ).order_by('-fecha_limite')

        return Response(PrestamoSerializer(prestamos_vencidos, many=True).data)

    @action(detail=False, methods=['get'], url_path='por-vencer')
    def por_vencer(self, request):

        if verificarToken.validarRol(request) is not True:
            return Response({'error': 'Permisos insuficientes'}, status=403)

        hoy = timezone.now().date()
        limite = hoy + timedelta(hours=48)

        prestamos = Prestamo.objects.filter(
            estado="Prestado",
            fecha_limite__gte=hoy,
            fecha_limite__lte=limite
        ).order_by("fecha_limite")

        return Response(PrestamoSerializer(prestamos, many=True).data)