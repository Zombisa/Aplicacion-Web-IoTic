#!/bin/bash
# Script para ejecutar solo el proyecto Angular
# Uso: ./run_angular.sh

set -e

ANGULAR_DIR="Frontend/Web-IoTic-Front"
ANGULAR_PORT=4200

# Función para iniciar el frontend (Angular)
start_angular() {
    echo "========================================"
    echo "   Iniciando proyecto Angular localmente"
    echo "========================================"

    cd $ANGULAR_DIR || exit 1

    if [ -f "package.json" ]; then
        echo "[INFO] Instalando dependencias de Angular..."
        npm install
        echo "[OK] Dependencias instaladas"
    else
        echo "[ERROR] No se encontró package.json"
        exit 1
    fi

    echo "[INFO] Iniciando servidor Angular en puerto $ANGULAR_PORT..."
    npm start -- --host 0.0.0.0 --port $ANGULAR_PORT
}

start_angular
