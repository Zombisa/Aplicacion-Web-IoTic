from rest_framework import serializers
from apps.informacion.Models.TutoriaEnMarcha import TutoriaEnMarcha

class TutoriaEnMarchaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutoriaEnMarcha
        fields = '__all__'
        read_only_fields = ['usuario']