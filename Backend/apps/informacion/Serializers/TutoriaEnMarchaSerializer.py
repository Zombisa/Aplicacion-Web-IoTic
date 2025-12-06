from rest_framework import serializers
from apps.informacion.Models.TutoriaEnMarcha import TutoriaEnMarcha

class TutoriaEnMarchaSerializer(serializers.ModelSerializer):
    """Serialize tutorías en marcha asegurando que `usuario` permanezca solo lectura."""
    class Meta:
        model = TutoriaEnMarcha
        fields = '__all__'
        read_only_fields = ['usuario']