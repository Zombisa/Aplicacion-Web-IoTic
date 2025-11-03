from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.timezone import now
from .models import Inventario, Prestamo
from .serializers import InventarioSerializer, PrestamoSerializer
from .decorators import verificar_token
from django.utils.decorators import method_decorator
from .services import PrestamoService


@method_decorator(verificar_token, name='dispatch')
class InventarioViewSet(viewsets.ModelViewSet):
    queryset = Inventario.objects.all()
    serializer_class = InventarioSerializer


@method_decorator(verificar_token, name='dispatch')
class PrestamoViewSet(viewsets.ModelViewSet):
    queryset = Prestamo.objects.all()
    serializer_class = PrestamoSerializer

    def create(self, request, *args, **kwargs):
        item_id = request.data.get("item_id")
        nombre_persona = request.data.get("nombre_persona")

        if not item_id or not nombre_persona:
            return Response({"error": "Se requiere item_id y nombre_persona"}, status=400)

        try:
            item = Inventario.objects.get(id=item_id)
        except Inventario.DoesNotExist:
            return Response({"error": "El item no existe"}, status=404)

        # Validación para ítems devolutivos y consumibles
        if item.cantidad_prestada == 1:
            return Response({"error": "No hay unidades disponibles de este ítem"}, status=400)

        # Registrar el préstamo
        prestamo = Prestamo.objects.create(
            nombre_persona=nombre_persona,
            item=item,
            fecha_prestamo=now(),
            estado="prestado"
        )

        # Actualizar cantidades
        item.cantidad_disponible = 0
        item.cantidad_prestada = 1
        item.estadoAdministrativo = 'prestado'
        item.save()

        serializer = PrestamoSerializer(prestamo)
        return Response(serializer.data, status=201)

    @action(detail=True, methods=['post'], url_path='devolver')
    def devolver(self, request, pk=None):
        prestamo = self.get_object()

        if prestamo.estado == "devuelto":
            return Response({"message": "Este préstamo ya fue devuelto"}, status=400)

        prestamo.estado = "devuelto"
        prestamo.fecha_devolucion = now()
        prestamo.save()

        # Actualizar inventario
        item = prestamo.item
        item.cantidad_disponible = 1
        item.cantidad_prestada = 0
        item.estadoAdministrativo = 'disponible'
        item.save()

        return Response({"message": "Ítem devuelto correctamente"}, status=200)

    @action(detail=False, methods=['get'], url_path='historico')
    def historico(self, request):
        prestamos = Prestamo.objects.all().order_by('-fecha_prestamo')
        serializer = PrestamoSerializer(prestamos, many=True)
        return Response(serializer.data)