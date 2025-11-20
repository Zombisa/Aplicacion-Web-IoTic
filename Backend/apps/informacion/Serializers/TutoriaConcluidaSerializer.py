from rest_framework import serializers
from apps.informacion.Models.TutoriaConcluida import TutoriaConcluida

class TutoriaConcluidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TutoriaConcluida
        fields = '__all__'
        read_only_fields = ['usuario']