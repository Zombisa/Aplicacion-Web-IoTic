from rest_framework import serializers
from .models import Inventario, Prestamo
from django.contrib.auth import get_user_model

User = get_user_model()

class InventarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventario
        fields = '__all__'


class PrestamoSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Prestamo.
    - Campos de solo lectura: id, usuario, item, fecha_prestamo
    - Campos para crear/editar: usuario_id, item_id, fecha_devolucion, estado
    """

    # Campos de solo lectura (GET)
    id = serializers.IntegerField(read_only=True)
    usuario = serializers.StringRelatedField(read_only=True)
    item = serializers.StringRelatedField(read_only=True)
    fecha_prestamo = serializers.DateField(read_only=True)

    # Campos para POST/PUT (escribir IDs)
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='usuario',
        write_only=True
    )
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=Inventario.objects.all(),
        source='item',
        write_only=True
    )

    # Otros campos editables
    fecha_devolucion = serializers.DateField(required=False, allow_null=True)
    estado = serializers.ChoiceField(
        choices=Prestamo.ESTADO_CHOICES,
        required=False,
        default='pendiente'
    )

    class Meta:
        model = Prestamo
        fields = ['id', 'usuario','item', 'usuario_id', 'item_id', 'fecha_prestamo', 'fecha_devolucion', 'estado',] 