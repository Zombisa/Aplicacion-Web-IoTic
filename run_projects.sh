#!/bin/bash
# Script para ejecutar tanto el backend (Django) como el frontend (Angular)
# Uso: ./run_projects.sh

set -e

DJANGO_PORT=8000
ANGULAR_PORT=4200

# Función para iniciar el backend (Django)
start_django() {
    echo "========================================"
    echo "   Iniciando proyecto Django localmente"
    echo "========================================"

    if [ ! -d "Backend/.venv" ]; then
        echo "[ERROR] No se encontró el entorno virtual 'Backend/.venv'"
        echo "[INFO] Creando entorno virtual..."
        python3 -m venv Backend/.venv
        echo "[OK] Entorno virtual creado"
    fi

    echo "[INFO] Activando entorno virtual..."
    source Backend/.venv/bin/activate

    if [ -f "Backend/requirements.txt" ]; then
        echo "[INFO] Verificando dependencias..."
        if ! pip show Django > /dev/null 2>&1; then
            echo "[INFO] Instalando dependencias desde requirements.txt..."
            pip install -r Backend/requirements.txt
            echo "[OK] Dependencias instaladas"
        else
            echo "[OK] Dependencias ya instaladas"
        fi
    fi

    echo "[INFO] Creando migraciones..."
    python Backend/manage.py makemigrations

    echo "[INFO] Aplicando migraciones..."
    python Backend/manage.py migrate

    echo "[INFO] Iniciando servidor de desarrollo en puerto $DJANGO_PORT..."
    python Backend/manage.py runserver "0.0.0.0:$DJANGO_PORT" &
    DJANGO_PID=$!
}

# Función para iniciar el frontend (Angular)
start_angular() {
    echo "========================================"
    echo "   Iniciando proyecto Angular localmente"
    echo "========================================"

    cd Frontend/Web-IoTic-Front || exit 1

    if [ -f "package.json" ]; then
        echo "[INFO] Instalando dependencias de Angular..."
        npm install
        echo "[OK] Dependencias instaladas"
    else
        echo "[ERROR] No se encontró package.json"
        exit 1
    fi

    echo "[INFO] Iniciando servidor Angular en puerto $ANGULAR_PORT..."
    npm start -- --host 0.0.0.0 --port $ANGULAR_PORT &
    ANGULAR_PID=$!
}

# Función para detener ambos servidores
stop_servers() {
    echo "[INFO] Deteniendo servidores..."
    if [ -n "$DJANGO_PID" ]; then
        kill $DJANGO_PID
    fi
    if [ -n "$ANGULAR_PID" ]; then
        kill $ANGULAR_PID
    fi
    echo "[INFO] Servidores detenidos."
}

trap stop_servers EXIT

start_django
start_angular

wait
