from rest_framework import serializers
from apps.informacion.Models.ParticipacionComitesEv import ParticipacionComitesEv

class ParticipacionComitesEvSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParticipacionComitesEv
        fields = '__all__'
        read_only_fields = ['usuario']