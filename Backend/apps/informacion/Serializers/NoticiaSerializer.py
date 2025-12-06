from rest_framework import serializers
from  apps.informacion.Models.Noticia import Noticia

class NoticiaSerializer(serializers.ModelSerializer):
    """Serialize noticias manteniendo `usuario` como solo lectura."""
    class Meta:
        model = Noticia
        fields = '__all__'
        read_only_fields = ['usuario']