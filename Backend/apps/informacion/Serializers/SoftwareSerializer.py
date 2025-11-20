from rest_framework import serializers
from apps.informacion.Models.Software import Software

class SoftwareSerializer(serializers.ModelSerializer):
    class Meta:
        model = Software
        fields = '__all__'
        read_only_fields = ['usuario']