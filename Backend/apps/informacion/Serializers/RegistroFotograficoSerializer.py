from rest_framework import serializers
from apps.informacion.Models.RegistroFotografico import RegistroFotografico

class RegistroFotograficoSerializer(serializers.ModelSerializer):
    """Serializa registros fotográficos manteniendo `usuario` como solo lectura."""
    class Meta:
        model = RegistroFotografico
        fields = '__all__'
        read_only_fields = ['usuario']
