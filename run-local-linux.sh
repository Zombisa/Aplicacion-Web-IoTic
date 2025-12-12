#!/bin/bash
# Script para ejecutar el proyecto Django localmente (Linux/Mac)
# Uso: ./run-local.sh [puerto]
# Ejemplo: ./run-local.sh 8000

set -e

PORT=${1:-8000}

echo ""
echo "========================================"
echo "  Iniciando proyecto Django localmente"
echo "========================================"
echo ""

# Verificar si existe el entorno virtual
if [ ! -d "venv" ]; then
    echo "[ERROR] No se encontro el entorno virtual 'venv'"
    echo "[INFO] Creando entorno virtual..."
    python3 -m venv venv
    echo "[OK] Entorno virtual creado"
fi

# Activar el entorno virtual
echo "[INFO] Activando entorno virtual..."
source venv/bin/activate

# Instalar dependencias si existen
if [ -f "requirements.txt" ]; then
    echo "[INFO] Verificando dependencias..."
    
    if ! pip show Django > /dev/null 2>&1; then
        echo "[INFO] Instalando dependencias desde requirements.txt..."
        pip install -r requirements.txt
        echo "[OK] Dependencias instaladas"
    else
        echo "[OK] Dependencias ya instaladas"
    fi
fi

# Crear y aplicar migraciones
echo ""
echo "[INFO] Creando migraciones..."
python manage.py makemigrations

echo ""
echo "[INFO] Aplicando migraciones..."
python manage.py migrate

if [ $? -ne 0 ]; then
    echo "[ERROR] Error al aplicar migraciones"
    exit 1
fi
echo "[OK] Migraciones aplicadas correctamente"

# Iniciar el servidor de desarrollo
echo ""
echo "[INFO] Iniciando servidor de desarrollo en puerto $PORT..."
echo "[INFO] Presiona Ctrl+C para detener el servidor"
echo ""
echo "========================================"
echo "  Servidor iniciando..."
echo "========================================"
echo ""

python manage.py runserver "0.0.0.0:$PORT"
