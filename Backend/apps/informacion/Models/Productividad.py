from django.db import models

class Mision(models.Model):
    contenido = models.TextField()
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "mision"

    def __str__(self):
        return "Misión"


class Vision(models.Model):
    contenido = models.TextField()
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "vision"

    def __str__(self):
        return "Visión"


class Historia(models.Model):
    contenido = models.TextField()
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "historia"

    def __str__(self):
        return "Historia"


class Objetivo(models.Model):
    titulo = models.CharField(max_length=200)
    contenido = models.TextField()
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "objetivos"

    def __str__(self):
        return self.titulo


class Valor(models.Model):
    titulo = models.CharField(max_length=200)
    contenido = models.TextField()
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "valores"

    def __str__(self):
        return self.titulo