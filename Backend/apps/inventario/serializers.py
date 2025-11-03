from rest_framework import serializers
from .models import Inventario, Prestamo
from .services import PrestamoService

class InventarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventario
        fields = '__all__'

    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        cantidad_prestada = validated_data.get('cantidad_prestada', instance.cantidad_prestada)
        if(cantidad_prestada == 1):
            validated_data['estadoAdministrativo'] = 'prestado'
        else:
            validated_data['estadoAdministrativo'] = 'disponible'

        return super().update(instance, validated_data)


class PrestamoSerializer(serializers.ModelSerializer):
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=Inventario.objects.all(),
        source='item',
        write_only=True
    )
    
    item = InventarioSerializer(read_only=True)

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
