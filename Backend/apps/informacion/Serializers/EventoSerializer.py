from rest_framework import serializers
from  apps.informacion.Models.Evento import Evento

class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = '__all__'
        read_only_fields = ['usuario']