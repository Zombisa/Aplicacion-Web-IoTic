from rest_framework import serializers
from apps.informacion.Models.ProcesoTecnica import ProcesoTecnica


class ProcesoTecnicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcesoTecnica
        fields = '__all__'
        read_only_fields = ['usuario']