from django.db import models

class Rol(models.Model):
    """Rol de aplicación, usado para claims de Firebase y control de acceso."""

    nombre = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'rol'
    
    def __str__(self):
        return self.nombre


class Usuario(models.Model):
    """Usuario sincronizado entre Firebase Auth, Firestore y PostgreSQL."""

    uid_firebase = models.CharField(max_length=128, unique=True, null=True, blank=True)  # UID de Firebase
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    contrasena = models.CharField(max_length=200)
    fechaRegistro = models.DateField(auto_now_add=True)
    estado = models.BooleanField(default=True)
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        db_table = 'usuario'

    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.rol.nombre}"
