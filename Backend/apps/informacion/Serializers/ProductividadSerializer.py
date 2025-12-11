from rest_framework import serializers
from apps.informacion.Models.Productividad import (
    Mision, Vision, Historia, Objetivo, Valor
)

class MisionSerializer(serializers.ModelSerializer):
    """Serialize el texto de la misión institucional."""
    class Meta:
        model = Mision
        fields = "__all__"


class VisionSerializer(serializers.ModelSerializer):
    """Serialize la declaración de visión institucional."""
    class Meta:
        model = Vision
        fields = "__all__"


class HistoriaSerializer(serializers.ModelSerializer):
    """Serialize reseñas históricas de la institución."""
    class Meta:
        model = Historia
        fields = "__all__"


class ObjetivoSerializer(serializers.ModelSerializer):
    """Serialize objetivos estratégicos registrados."""
    class Meta:
        model = Objetivo
        fields = "__all__"


class ValorSerializer(serializers.ModelSerializer):
    """Serialize valores institucionales definidos."""
    class Meta:
        model = Valor
        fields = "__all__"
