from django.db import models

class Rol(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre


class Usuario(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    contrasena = models.CharField(max_length=200)
    fechaRegistro = models.DateField(auto_now_add=True)
    estado = models.BooleanField(default=True)
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE, related_name="usuarios")

    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.rol.nombre}"
