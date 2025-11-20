from rest_framework import serializers
from apps.informacion.Models.Jurado import Jurado

class JuradoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jurado
        fields = '__all__'
        read_only_fields = ['usuario']