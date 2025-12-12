#!/bin/bash
# Script para ejecutar el proyecto Angular en Linux
# Uso: ./run_angular_linux.sh

set -e

ANGULAR_DIR="Frontend/Web-IoTic-Front"
ANGULAR_PORT=4200

# Navegar al directorio del proyecto Angular
cd $ANGULAR_DIR || {
    echo "[ERROR] No se pudo encontrar el directorio $ANGULAR_DIR"
    exit 1
}

# Verificar si existe package.json
if [ ! -f "package.json" ]; then
    echo "[ERROR] No se encontró package.json en $ANGULAR_DIR"
    exit 1
fi

# Instalar dependencias
echo "[INFO] Instalando dependencias de Angular..."
npm install

# Iniciar el servidor de desarrollo
echo "[INFO] Iniciando servidor Angular en puerto $ANGULAR_PORT..."
npm start -- --host 0.0.0.0 --port $ANGULAR_PORT
