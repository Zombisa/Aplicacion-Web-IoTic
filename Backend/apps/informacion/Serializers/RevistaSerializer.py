from rest_framework import serializers
from apps.informacion.Models.Revista import Revista

class RevistaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Revista
        fields = '__all__'
        read_only_fields = ['usuario']