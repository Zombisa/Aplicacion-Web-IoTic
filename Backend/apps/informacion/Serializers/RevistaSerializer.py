from rest_framework import serializers
from apps.informacion.Models.Revista import Revista

class RevistaSerializer(serializers.ModelSerializer):
    """Serialize revistas científicas o institucionales manteniendo `usuario` como solo lectura."""
    class Meta:
        model = Revista
        fields = '__all__'
        read_only_fields = ['usuario']