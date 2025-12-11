from rest_framework import serializers
from apps.informacion.Models.Jurado import Jurado

class JuradoSerializer(serializers.ModelSerializer):
    """Serialize jurados manteniendo `usuario` como campo de solo lectura."""
    class Meta:
        model = Jurado
        fields = '__all__'
        read_only_fields = ['usuario']