from rest_framework import serializers
from  apps.informacion.Models.Noticia import Noticia

class NoticiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Noticia
        fields = '__all__'
        read_only_fields = ['usuario']