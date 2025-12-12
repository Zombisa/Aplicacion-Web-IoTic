#!/bin/bash
# Script para ejecutar tanto el backend (Django) como el frontend (Angular)
# Uso: ./run_projects.sh

set -e

DJANGO_PORT=8000
ANGULAR_PORT=4200
DJANGO_PID=""
ANGULAR_PID=""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_success() { echo -e "${GREEN}[OK]${NC} $1"; }
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# Verificar puertos disponibles
check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_error "El puerto $port ya está en uso (necesario para $service)"
        print_info "Ejecuta: lsof -ti:$port | xargs kill -9"
        return 1
    fi
    return 0
}

# Función para iniciar el backend (Django)
start_django() {
    echo ""
    echo "========================================"
    echo "   Iniciando proyecto Django"
    echo "========================================"

    # Verificar que existe el directorio Backend
    if [ ! -d "Backend" ]; then
        print_error "No se encontró el directorio 'Backend/'"
        exit 1
    fi

    # Verificar puerto disponible
    check_port $DJANGO_PORT "Django" || exit 1

    # Crear entorno virtual si no existe
    if [ ! -d "Backend/.venv" ]; then
        print_warning "No se encontró el entorno virtual 'Backend/.venv'"
        print_info "Creando entorno virtual..."
        python3 -m venv Backend/.venv || {
            print_error "Fallo al crear el entorno virtual"
            print_error "Verifica que python3-venv esté instalado: sudo apt install python3-venv"
            exit 1
        }
        print_success "Entorno virtual creado"
    fi

    # Verificar que el activate existe antes de ejecutarlo
    if [ ! -f "Backend/.venv/bin/activate" ]; then
        print_error "El archivo activate no existe en Backend/.venv/bin/"
        print_error "Eliminando .venv corrupto..."
        rm -rf Backend/.venv
        print_info "Intenta ejecutar el script nuevamente"
        exit 1
    fi

    print_info "Activando entorno virtual..."
    source Backend/.venv/bin/activate || {
        print_error "Fallo al activar el entorno virtual"
        exit 1
    }

    # Instalar/actualizar dependencias
    if [ -f "Backend/requirements.txt" ]; then
        print_info "Verificando dependencias..."
        pip install -q --upgrade pip
        pip install -q -r Backend/requirements.txt
        print_success "Dependencias actualizadas"
    else
        print_warning "No se encontró requirements.txt"
    fi

    # Verificar manage.py
    if [ ! -f "Backend/manage.py" ]; then
        print_error "No se encontró Backend/manage.py"
        exit 1
    fi

    # Migraciones
    print_info "Creando migraciones..."
    python Backend/manage.py makemigrations --noinput 2>&1 | grep -v "No changes detected" || true

    print_info "Aplicando migraciones..."
    python Backend/manage.py migrate --noinput

    # Colectar archivos estáticos (opcional)
    # python Backend/manage.py collectstatic --noinput --clear

    print_info "Iniciando servidor Django en http://0.0.0.0:$DJANGO_PORT"
    python Backend/manage.py runserver "0.0.0.0:$DJANGO_PORT" > django.log 2>&1 &
    DJANGO_PID=$!
    
    sleep 2
    if kill -0 $DJANGO_PID 2>/dev/null; then
        print_success "Django corriendo (PID: $DJANGO_PID)"
    else
        print_error "Django falló al iniciar. Ver django.log"
        exit 1
    fi
}

# Función para iniciar el frontend (Angular)
start_angular() {
    echo ""
    echo "========================================"
    echo "   Iniciando proyecto Angular"
    echo "========================================"

    # Verificar directorio
    if [ ! -d "Frontend/Web-IoTic-Front" ]; then
        print_error "No se encontró el directorio 'Frontend/Web-IoTic-Front/'"
        exit 1
    fi

    cd Frontend/Web-IoTic-Front || exit 1

    # Verificar puerto disponible
    check_port $ANGULAR_PORT "Angular" || exit 1

    # Verificar Node.js y npm
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm no está instalado"
        exit 1
    fi

    print_info "Node: $(node --version), npm: $(npm --version)"

    # Instalar dependencias
    if [ -f "package.json" ]; then
        print_info "Instalando dependencias de Angular..."
        npm install --silent || {
            print_error "Fallo al instalar dependencias"
            exit 1
        }
        print_success "Dependencias instaladas"
    else
        print_error "No se encontró package.json"
        exit 1
    fi

    print_info "Iniciando servidor Angular en http://0.0.0.0:$ANGULAR_PORT"
    npm start -- --host 0.0.0.0 --port $ANGULAR_PORT > ../../angular.log 2>&1 &
    ANGULAR_PID=$!

    cd ../..

    sleep 3
    if kill -0 $ANGULAR_PID 2>/dev/null; then
        print_success "Angular corriendo (PID: $ANGULAR_PID)"
    else
        print_error "Angular falló al iniciar. Ver angular.log"
        exit 1
    fi
}

# Función para detener ambos servidores
stop_servers() {
    echo ""
    print_info "Deteniendo servidores..."
    
    if [ -n "$DJANGO_PID" ] && kill -0 $DJANGO_PID 2>/dev/null; then
        kill $DJANGO_PID 2>/dev/null
        print_success "Django detenido"
    fi
    
    if [ -n "$ANGULAR_PID" ] && kill -0 $ANGULAR_PID 2>/dev/null; then
        kill $ANGULAR_PID 2>/dev/null
        print_success "Angular detenido"
    fi
    
    # Limpiar procesos hijo
    pkill -P $$ 2>/dev/null || true
    
    print_info "Limpieza completada"
}

# Capturar señales de terminación
trap stop_servers EXIT INT TERM

# Verificar Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 no está instalado"
    exit 1
fi

# Inicio del script
echo "========================================"
echo "   IoTic - Inicializador de Proyectos"
echo "========================================"
print_info "Python: $(python3 --version)"

start_django
start_angular

echo ""
echo "========================================"
print_success "Ambos servidores están corriendo"
echo "========================================"
echo "  Django:  http://localhost:$DJANGO_PORT"
echo "  Angular: http://localhost:$ANGULAR_PORT"
echo ""
print_info "Presiona Ctrl+C para detener ambos servidores"
echo ""

# Mantener el script corriendo
wait