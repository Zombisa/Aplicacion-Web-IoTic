from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator

from .models import Inventario, Prestamo
from .serializers import InventarioSerializer, PrestamoSerializer
from .services import crear_items_masivo, registrar_prestamo, registrar_devolucion
from .decorators import verificar_token


@method_decorator(verificar_token(), name='dispatch')
class InventarioViewSet(viewsets.ModelViewSet):
    queryset = Inventario.objects.all().order_by('-id')
    serializer_class = InventarioSerializer

    @method_decorator(verificar_token(["admin"]), name='create')
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @method_decorator(verificar_token(["admin"]), name='update')
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @method_decorator(verificar_token(["admin"]), name='partial_update')
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @method_decorator(verificar_token(["admin"]), name='destroy')
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @method_decorator(verificar_token(["admin"]))
    @action(detail=False, methods=['post'], url_path='masivo')
    def crear_masivo(self, request):
        try:
            creados = crear_items_masivo(request.data)
            return Response({
                "message": f"{len(creados)} ítems creados correctamente.",
                "items": InventarioSerializer(creados, many=True).data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

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

    @action(detail=True, methods=['patch'], url_path='dar-baja')
    def dar_baja(self, request, pk=None):
        """
        Marca un ítem como Dañado (Dar de baja).
        - Cambia estado_fisico a 'Dañado'
        - Cambia estado_admin a 'No prestar'
        """
        item = get_object_or_404(Inventario, pk=pk)

        # Si ya está de baja
        if item.estado_fisico == "Dañado":
            return Response({"message": "El ítem ya está dado de baja."}, status=200)

        # Actualizamos estados
        item.estado_fisico = "Dañado"
        item.estado_admin = "No prestar"
        item.save()

        return Response({
            "message": "Ítem dado de baja correctamente.",
            "item": InventarioSerializer(item).data
        }, status=200)


@method_decorator(verificar_token(), name='dispatch')
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
            return Response(PrestamoSerializer(prestamo).data, status=status.HTTP_201_CREATED)
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

    @method_decorator(verificar_token(["admin"]), name='destroy')
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='activos')
    def activos(self, request):
        qs = Prestamo.objects.filter(estado='Prestado')
        return Response(PrestamoSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='devueltos')
    def devueltos(self, request):
        qs = Prestamo.objects.filter(estado='Devuelto')
        return Response(PrestamoSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='historico')
    def historico(self, request):
        qs = Prestamo.objects.all().order_by('-fecha_prestamo')
        return Response(PrestamoSerializer(qs, many=True).data)

