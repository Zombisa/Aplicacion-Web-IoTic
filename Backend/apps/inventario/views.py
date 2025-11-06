from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.timezone import now
from .models import Inventario, Prestamo
from .serializers import InventarioSerializer, PrestamoSerializer
from .decorators import verificar_token
from django.utils.decorators import method_decorator
from .services import PrestamoService
from django.utils.dateparse import parse_date
from django.utils import timezone
from datetime import datetime, time as dt_time


@method_decorator(verificar_token, name='dispatch')
class InventarioViewSet(viewsets.ModelViewSet):
    queryset = Inventario.objects.all()
    serializer_class = InventarioSerializer

    @action(detail = True, methods = ['put'], url_path='actualizar')
    def update_item(self, request, pk=None):
        inventario = self.get_object()
        serializer = InventarioSerializer(inventario, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200, headers={"message": "Ítem actualizado correctamente"})
        return Response(serializer.errors, status=400)
    
    @action(detail = True, methods = ['delete'], url_path='eliminar')
    def delete_item(self, request, pk=None):
        inventario = self.get_object()
        inventario.delete()
        return Response({"message": "Ítem eliminado correctamente"}, status=204)
    
    @action(detail = True, methods = ['patch'], url_path='darDeBaja')
    def dar_de_baja(self, request, pk=None):
        inventario = self.get_object()
        inventario.estadoAdministrativo = request.data.get("estadoAdministrativo")
        inventario.cantidad_disponible = 0
        inventario.cantidad_prestada = 0
        inventario.save()
        serializer = InventarioSerializer(inventario)
        return Response(serializer.data, status=200, headers={"message": "Ítem dado de baja correctamente"})
    
@method_decorator(verificar_token, name='dispatch')
class PrestamoViewSet(viewsets.ModelViewSet):
    queryset = Prestamo.objects.all()
    serializer_class = PrestamoSerializer

    def create(self, request, *args, **kwargs):
        item_id = request.data.get("item_id")
        nombre_persona = request.data.get("nombre_persona")
        fecha_devolucion = request.data.get("fecha_devolucion")

        if not item_id or not nombre_persona:
            return Response({"error": "Se requiere item_id y nombre_persona"}, status=400)

        try:
            item = Inventario.objects.get(id=item_id)
        except Inventario.DoesNotExist:
            return Response({"error": "El item no existe"}, status=404)

        # Validación para ítems devolutivos y consumibles
        if item.cantidad_prestada == 1:
            return Response({"error": "No hay unidades disponibles de este ítem"}, status=400)

        if item.estadoAdministrativo == 'no prestable':
            return Response({"error": "Este ítem no puede ser prestado"}, status=400)
        
        if item.estadoAdministrativo == 'dado de baja':
            return Response({"error": "Este ítem ha sido dado de baja y no puede ser prestado"}, status=400)
        
        #validar fecha de devolucion
        if not fecha_devolucion:
            return Response({"error": "Se requiere establecer una fecha de devolucion"}, status=400)
        
        fecha_parsed = parse_date(fecha_devolucion)  # devuelve date o None
        if fecha_parsed is None:
            return Response({"error": "Formato de fecha inválido. Use YYYY-MM-DD"}, status=400)
        
        # Combinar con fin de día para que la devolución sea válida durante todo el día
        fecha_dt = datetime.combine(fecha_parsed, dt_time.max)  # 23:59:59.999999
        fecha_dt = timezone.make_aware(fecha_dt)  # make it timezone-aware
        if timezone.now() >= fecha_dt:
            return Response({"error": "La fecha de devolución debe ser futura"}, status=400)
        
        # Registrar el préstamo
        prestamo = Prestamo.objects.create(
            nombre_persona=nombre_persona,
            item=item,
            fecha_prestamo=now(),
            fecha_devolucion=fecha_dt,
            estado="prestado"
        )

        # Actualizar cantidades
        item.cantidad_disponible = 0
        item.cantidad_prestada = 1
        item.estadoAdministrativo = 'prestado'
        item.save()

        serializer = PrestamoSerializer(prestamo)
        return Response(serializer.data, status=201)

    @action(detail=True, methods=['put'], url_path='devolver')
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
    
    #endpoints para reportes
    #Método para obtener el historial completo de préstamos
    @action(detail=False, methods=['get'], url_path='historico')
    def historico(self, request):
        prestamos = Prestamo.objects.all().order_by('-fecha_prestamo')
        serializer = PrestamoSerializer(prestamos, many=True)
        return Response(serializer.data)
    
    #Método para obtener los préstamos activos
    @action(detail=False, methods=['get'], url_path='activos')
    def prestamos_activos(self, request):
        prestamos = Prestamo.objects.filter(estado='prestado').order_by('-fecha_prestamo')
        serializer = PrestamoSerializer(prestamos, many=True)
        return Response(serializer.data)
    
    #Método para obtener los préstamos devueltos
    @action(detail=False, methods=['get'], url_path='devueltos')
    def prestamos_devueltos(self, request):
        prestamos = Prestamo.objects.filter(estado='devuelto').order_by('-fecha_prestamo')
        serializer = PrestamoSerializer(prestamos, many=True)
        return Response(serializer.data)