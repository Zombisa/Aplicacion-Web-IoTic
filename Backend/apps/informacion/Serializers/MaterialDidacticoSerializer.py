from rest_framework import serializers
from apps.informacion.Models.MaterialDidactico import MaterialDidactico

class MaterialDidacticoSerializer(serializers.ModelSerializer):
    """Serialize material didáctico asegurando que `usuario` permanezca solo lectura."""
    class Meta:
        model = MaterialDidactico
        fields = '__all__'
        read_only_fields = ['usuario']