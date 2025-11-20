from rest_framework import serializers
from apps.informacion.Models.Libro import Libro

class LibroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Libro
        fields = '__all__'
        read_only_fields = ['usuario']