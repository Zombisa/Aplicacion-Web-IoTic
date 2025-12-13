#!/bin/bash
# Script para ejecutar docker-compose con feedback detallado
# Uso: ./run_docker_compose.sh

set -e

# Verificar si docker-compose.yml existe
if [ ! -f "docker-compose.yml" ]; then
    echo "[ERROR] No se encontró el archivo docker-compose.yml en el directorio actual."
    exit 1
fi

# Construir imágenes
echo "Construyendo imágenes..."
docker compose buildch

# Iniciar servicios
echo "Iniciando servicios..."
docker compose up -d

# Verificar el estado de los contenedores
echo " Verificando el estado de los contenedores..."
docker compose ps

# Mostrar logs en tiempo real
echo " Mostrando logs en tiempo real. Presiona Ctrl+C para detener los logs."
docker compose logs -f
