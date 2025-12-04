from rest_framework import serializers
from apps.informacion.Models.Productividad import (
    Mision, Vision, Historia, Objetivo, Valor
)

class MisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mision
        fields = "__all__"


class VisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vision
        fields = "__all__"


class HistoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Historia
        fields = "__all__"


class ObjetivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Objetivo
        fields = "__all__"


class ValorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Valor
        fields = "__all__"
