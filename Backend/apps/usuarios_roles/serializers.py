from rest_framework import serializers
from .models import Usuario, Rol


class RolSerializer(serializers.ModelSerializer):
    """Serializa roles para CRUD simple."""

    class Meta:
        model = Rol
        fields = "__all__"


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializa usuarios mostrando el nombre de rol y permitiendo rol_id para escritura."""

    rol = serializers.CharField(source="rol.nombre", read_only=True)
    rol_id = serializers.PrimaryKeyRelatedField(
        queryset=Rol.objects.all(),
        source="rol",
        write_only=True
    )

    class Meta:
        model = Usuario
        fields = [
            "id",
            "uid_firebase",
            "nombre",
            "apellido",
            "email",
            "contrasena",
            "fechaRegistro",
            "estado",
            "rol",
            "rol_id"
        ]
