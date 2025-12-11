from rest_framework import serializers
from apps.informacion.Models.ProcesoTecnica import ProcesoTecnica


class ProcesoTecnicaSerializer(serializers.ModelSerializer):
    """Serialize procesos técnicos manteniendo `usuario` como solo lectura."""
    class Meta:
        model = ProcesoTecnica
        fields = '__all__'
        read_only_fields = ['usuario']