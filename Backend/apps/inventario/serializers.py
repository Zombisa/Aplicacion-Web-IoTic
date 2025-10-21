from rest_framework import serializers
from .models import Inventario, Prestamo
from .services import PrestamoService

class InventarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventario
        fields = '__all__'
        read_only_fields = ['cantidad_prestada']

    def validate(self, data):
        cantidad_total = data.get('cantidad_total', self.instance.cantidad_total if self.instance else None)
        cantidad_disponible = data.get('cantidad_disponible', self.instance.cantidad_disponible if self.instance else None)

        if cantidad_disponible > cantidad_total:
            raise serializers.ValidationError("La cantidad disponible no puede ser mayor que la cantidad total.")

        return data

    def create(self, validated_data):
        validated_data['cantidad_prestada'] = validated_data['cantidad_total'] - validated_data['cantidad_disponible']
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Si actualizan cantidades, recalculamos prestados
        if 'cantidad_total' in validated_data or 'cantidad_disponible' in validated_data:
            cantidad_total = validated_data.get('cantidad_total', instance.cantidad_total)
            cantidad_disponible = validated_data.get('cantidad_disponible', instance.cantidad_disponible)

            validated_data['cantidad_prestada'] = cantidad_total - cantidad_disponible

        return super().update(instance, validated_data)


class PrestamoSerializer(serializers.ModelSerializer):
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=Inventario.objects.all(),
        source='item',
        write_only=True
    )

    class Meta:
        model = Prestamo
        fields = ['id', 'nombre_persona', 'item', 'item_id', 'fecha_prestamo', 'fecha_devolucion', 'estado']
        read_only_fields = ['id', 'item', 'fecha_prestamo']

    def create(self, validated_data):
        return PrestamoService.registrar_prestamo(validated_data)

    def update(self, instance, validated_data):
        nuevo_estado = validated_data.get("estado", instance.estado)

        if nuevo_estado == "devuelto":
            return PrestamoService.registrar_devolucion(instance, nuevo_estado)

        return super().update(instance, validated_data)
