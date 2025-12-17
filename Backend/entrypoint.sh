#!/bin/sh
set -e

# --- Configuración de la base de datos ---
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-postgres}"

echo " Esperando a PostgreSQL en $DB_HOST:$DB_PORT..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; do
  echo "Esperando a PostgreSQL..."
  sleep 2
done
echo " PostgreSQL disponible"

# --- Ejecutar migraciones ---
echo "Ejecutando migraciones..."
python manage.py migrate

# --- Recolectar archivos estáticos si está configurado STATIC_ROOT ---
if [ -n "$STATIC_ROOT" ]; then
  echo " Recolectando estáticos..."
  python manage.py collectstatic --noinput
fi

# --- Iniciar servidor Django ---
echo "Iniciando servidor Django..."
exec python manage.py runserver 0.0.0.0:8000




