from rest_framework import serializers
from apps.informacion.Models.ParticipacionComitesEv import ParticipacionComitesEv

class ParticipacionComitesEvSerializer(serializers.ModelSerializer):
    """Serialize participaciones en comités evaluadores con `usuario` solo lectura."""
    class Meta:
        model = ParticipacionComitesEv
        fields = '__all__'
        read_only_fields = ['usuario']