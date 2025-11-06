#!/bin/bash
set -e

echo " Construyendo imágenes..."
docker-compose build

echo " Iniciando solo PostgreSQL primero..."
docker-compose up -d db

echo "Esperando a que PostgreSQL esté completamente disponible..."
timeout=60
counter=0
until docker-compose exec -T db pg_isready -U ${DB_USER:-postgres} -d ${DB_NAME:-aplicacion_web_iotic} > /dev/null 2>&1; do
  sleep 2
  counter=$((counter + 2))
  if [ $counter -gt $timeout ]; then
    echo "❌ Error: PostgreSQL no se inició en $timeout segundos"
    exit 1
  fi
  echo "   Esperando... ($counter/$timeout segundos)"
done

echo "PostgreSQL está listo. Iniciando microservicios..."
docker-compose up -d inventario informacion usuarios_roles

echo " Esperando a que los microservicios estén disponibles..."
sleep 10

echo " Aplicando migraciones en todos los servicios..."
services=("informacion" "inventario" "usuarios_roles")

for service in "${services[@]}"; do
  echo " Procesando servicio: $service"
  timeout=30
  counter=0
  until docker-compose exec -T "$service" python manage.py check --database default > /dev/null 2>&1; do
    sleep 2
    counter=$((counter + 2))
    if [ $counter -gt $timeout ]; then
      echo "❌ Error: $service no se conectó a la DB en $timeout segundos"
      continue
    fi
  done

  # Verificar si hay cambios sin migraciones
  if docker-compose exec -T "$service" python manage.py makemigrations --check --dry-run 2>&1 | grep -q "No changes detected"; then
    echo " No hay migraciones nuevas en $service"
  else
    echo " Generando migraciones en $service..."
    docker-compose exec -T "$service" python manage.py makemigrations
  fi

  # Aplicar migraciones
  echo "    Aplicando migraciones en $service..."
  docker-compose exec -T "$service" python manage.py migrate --noinput
done

echo " Verificando superusuario en 'inventario'..."
EXISTS=$(docker-compose exec -T inventario python manage.py shell -c "from django.contrib.auth import get_user_model; print(get_user_model().objects.filter(is_superuser=True).exists())" 2>/dev/null || echo "False")
if [ "$EXISTS" != "True" ]; then
  echo " Creando superusuario por defecto..."
  docker-compose exec -T inventario python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superusuario creado: admin/admin123')
else:
    print('Superusuario ya existe')
" || true
else
  echo "   ✅ Superusuario ya existente"
fi

echo ""
echo "✅ Todo listo. Servicios activos:"
echo " - PostgreSQL:      localhost:5432"
echo " - Inventario:      http://localhost:8000/"
echo " - Información:     http://localhost:8001/"
echo " - Usuarios/Roles:  http://localhost:8002/"
echo ""
echo " Estado de los contenedores:"
docker-compose ps