from rest_framework import serializers
from apps.informacion.Models.Curso import Curso

class CursoSerializer(serializers.ModelSerializer):
    """Serialize cursos académicos manteniendo `usuario` como solo lectura."""
    class Meta:
        model = Curso
        fields = '__all__'
        read_only_fields = ['usuario']