from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.utils import timezone
from datetime import timedelta

from .models import Inventario, Prestamo
from .serializers import InventarioSerializer, PrestamoSerializer
from .services import crear_items_masivo, registrar_prestamo, registrar_devolucion
from .decorators import verificar_token, verificar_roles


# ======================================================
#  INVENTARIO VIEWSET
# ======================================================

@method_decorator(verificar_token, name='dispatch')
class InventarioViewSet(viewsets.ModelViewSet):
    queryset = Inventario.objects.all().order_by('-id')
    serializer_class = InventarioSerializer

    @method_decorator(verificar_roles(["admin"]), name='create')
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @method_decorator(verificar_roles(["admin"]), name='update')
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @method_decorator(verificar_roles(["admin"]), name='partial_update')
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @method_decorator(verificar_roles(["admin"]), name='destroy')
    def destroy(self, request, *args, **kwargs):
        item = self.get_object()

        if item.prestamos.exists():
            return Response(
                {"error": "No se puede eliminar un ítem con préstamos asociados."},
                status=400
            )
        return super().destroy(request, *args, **kwargs)

    @method_decorator(verificar_roles(["admin"]))
    @action(detail=False, methods=['post'], url_path='masivo')
    def crear_masivo(self, request):
        try:
            creados = crear_items_masivo(request.data)
            return Response({
                "message": f"{len(creados)} ítems creados correctamente.",
                "items": InventarioSerializer(creados, many=True).data
            }, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

    # REPORTES
    @action(detail=False, methods=['get'], url_path='reportes/disponibles')
    def disponibles(self, request):
        qs = Inventario.objects.filter(estado_admin='Disponible')
        return Response(InventarioSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='reportes/prestados')
    def prestados(self, request):
        qs = Inventario.objects.filter(estado_admin='Prestado')
        return Response(InventarioSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='reportes/no-prestar')
    def no_prestar(self, request):
        qs = Inventario.objects.filter(estado_admin='No prestar')
        return Response(InventarioSerializer(qs, many=True).data)

    @method_decorator(verificar_roles(["admin"]))
    @action(detail=True, methods=['patch'], url_path='dar-baja')
    def dar_baja(self, request, pk=None):
        item = get_object_or_404(Inventario, pk=pk)

        if item.estado_fisico == "Dañado":
            return Response({"message": "El ítem ya está dado de baja."})

        item.estado_fisico = "Dañado"
        item.estado_admin = "No prestar"
        item.save()

        return Response({
            "message": "Ítem dado de baja correctamente.",
            "item": InventarioSerializer(item).data
        })

    @action(detail=True, methods=['get'], url_path='prestamos')
    def prestamos_por_item(self, request, pk=None):
        item = get_object_or_404(Inventario, pk=pk)

        prestamos = item.prestamos.all()

        estado = request.query_params.get("estado")
        if estado:
            estado = estado.capitalize()
            if estado in ["Prestado", "Devuelto"]:
                prestamos = prestamos.filter(estado=estado)

        activo = request.query_params.get("activo")
        if activo and activo.lower() == "true":
            prestamos = prestamos.filter(estado="Prestado")

        return Response(PrestamoSerializer(prestamos, many=True).data)
    
    @action(detail=True, methods=['get'], url_path='prestamos/vencidos')
    def prestamos_vencidos_por_item(self, request, pk=None):
        """
        Retorna los préstamos vencidos de un ítem en particular.
        - GET /inventario/items/<id>/prestamos/vencidos/
        """
        item = get_object_or_404(Inventario, pk=pk)

        hoy = timezone.now()

        prestamos_vencidos = item.prestamos.filter(
            estado="Prestado",
            fecha_limite__lt=hoy
        ).order_by('-fecha_limite')

        return Response(PrestamoSerializer(prestamos_vencidos, many=True).data)


# ======================================================
#  PRESTAMO VIEWSET
# ======================================================

@method_decorator(verificar_token, name='dispatch')
class PrestamoViewSet(viewsets.ModelViewSet):
    queryset = Prestamo.objects.all().order_by('-fecha_prestamo')
    serializer_class = PrestamoSerializer

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        item_id = data.get('item_id')
        if not item_id:
            return Response({"error": "item_id es requerido"}, status=400)

        item = get_object_or_404(Inventario, pk=item_id)
        data['item'] = item

        try:
            prestamo = registrar_prestamo(data)
            return Response(PrestamoSerializer(prestamo).data, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

    @action(detail=True, methods=['post'], url_path='devolver')
    def devolver(self, request, pk=None):
        prestamo = get_object_or_404(Prestamo, pk=pk)
        try:
            prestamo = registrar_devolucion(prestamo)
            return Response({
                "message": "Ítem devuelto correctamente.",
                "prestamo": PrestamoSerializer(prestamo).data
            })
        except Exception as e:
            return Response({"error": str(e)}, status=400)

    @method_decorator(verificar_roles(["admin"]), name='destroy')
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='activos')
    def activos(self, request):
        return Response(PrestamoSerializer(
            Prestamo.objects.filter(estado='Prestado'), many=True
        ).data)

    @action(detail=False, methods=['get'], url_path='devueltos')
    def devueltos(self, request):
        return Response(PrestamoSerializer(
            Prestamo.objects.filter(estado='Devuelto'), many=True
        ).data)

    @action(detail=False, methods=['get'], url_path='historico')
    def historico(self, request):
        return Response(PrestamoSerializer(
            Prestamo.objects.all().order_by('-fecha_prestamo'), many=True
        ).data)
    
    @action(detail=False, methods=['get'], url_path='vencidos')
    def vencidos(self, request):
        """
        Retorna todos los préstamos que ya pasaron su fecha límite
        pero aún no han sido devueltos.
        """
        hoy = timezone.now()

        prestamos_vencidos = Prestamo.objects.filter(
            estado="Prestado",
            fecha_limite__lt=hoy
        ).order_by('-fecha_limite')

        return Response(PrestamoSerializer(prestamos_vencidos, many=True).data)
    
    @action(detail=False, methods=['get'], url_path='por-vencer')
    def por_vencer(self, request):
        hoy = timezone.now().date()
        limite = hoy + timedelta(hours=48)

        prestamos = Prestamo.objects.filter(
            estado="Prestado",
            fecha_limite__gte=hoy,
            fecha_limite__lte=limite
        ).order_by("fecha_limite")

        return Response(PrestamoSerializer(prestamos, many=True).data)


