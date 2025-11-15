from rest_framework import serializers
from .models import Inventario, Prestamo

class InventarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventario
        fields = [
            'id', 'serial', 'descripcion',
            'estado_fisico', 'estado_admin',
            'fecha_registro','observacion'
        ]
        read_only_fields = ['id', 'serial', 'fecha_registro']


class PrestamoSerializer(serializers.ModelSerializer):
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=Inventario.objects.all(),
        source='item',
        write_only=True
    )

    class Meta:
        model = Prestamo
        fields = [
            'id',
            'item', 'item_id',
            'nombre_persona', 'cedula', 'telefono', 'correo', 'direccion',
            'fecha_prestamo', 'fecha_limite', 'fecha_devolucion',
            'estado'
        ]
        read_only_fields = ['id', 'item', 'fecha_prestamo', 'fecha_devolucion', 'estado']