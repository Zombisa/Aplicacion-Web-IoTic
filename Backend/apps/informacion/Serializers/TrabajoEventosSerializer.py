from rest_framework import serializers
from apps.informacion.Models.TrabajoEventos import TrabajoEventos

class TrabajoEventosSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrabajoEventos
        fields = '__all__'
        read_only_fields = ['usuario']