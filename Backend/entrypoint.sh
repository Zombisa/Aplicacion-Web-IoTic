#!/bin/bash

# Esperar a que la base de datos esté lista
echo "Esperando a que PostgreSQL esté listo..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL está listo!"

# Ejecutar migraciones
echo "Ejecutando migraciones..."
python manage.py migrate --noinput

# Ejecutar el comando pasado como argumento
echo "Iniciando servidor en $1..."
exec python manage.py runserver "$1"
