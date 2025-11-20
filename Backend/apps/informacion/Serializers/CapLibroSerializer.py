from rest_framework import serializers
from apps.informacion.Models.CapLibro import CapLibro

class CapLibroSerializer(serializers.ModelSerializer):
    class Meta:
        model = CapLibro
        fields = '__all__'
        read_only_fields = ['usuario']