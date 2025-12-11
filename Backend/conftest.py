"""
Configuración compartida para todos los tests del proyecto.
Este archivo contiene fixtures y configuraciones comunes.
"""

import pytest
from django.test import override_settings
from rest_framework.test import APIClient
from unittest.mock import patch, MagicMock

from apps.usuarios_roles.models import Usuario, Rol


# ==============================================
# FIXTURES DE BASE DE DATOS
# ==============================================

@pytest.fixture
def api_client():
    """Cliente API para realizar peticiones HTTP en los tests"""
    return APIClient()


@pytest.fixture
def rol_admin(db):
    """Fixture: Crea y retorna un rol de admin"""
    return Rol.objects.create(nombre='admin')


@pytest.fixture
def rol_mentor(db):
    """Fixture: Crea y retorna un rol de mentor"""
    return Rol.objects.create(nombre='mentor')


@pytest.fixture
def usuario_admin(db, rol_admin):
    """Fixture: Crea y retorna un usuario con rol admin"""
    return Usuario.objects.create(
        uid_firebase='admin_test_uid',
        nombre='Admin',
        apellido='Test',
        email='admin@test.com',
        contrasena='password123',
        rol=rol_admin,
        estado=True
    )


@pytest.fixture
def usuario_mentor(db, rol_mentor):
    """Fixture: Crea y retorna un usuario con rol mentor"""
    return Usuario.objects.create(
        uid_firebase='mentor_test_uid',
        nombre='Mentor',
        apellido='Test',
        email='mentor@test.com',
        contrasena='password123',
        rol=rol_mentor,
        estado=True
    )


# ==============================================
# FIXTURES DE AUTENTICACIÓN/AUTORIZACIÓN
# ==============================================

@pytest.fixture
def mock_verificar_token():
    """Mock del decorador de verificación de token"""
    with patch('apps.inventario.decorators.verificar_token') as mock:
        mock.return_value = lambda func: func
        yield mock


@pytest.fixture
def mock_verificar_roles():
    """Mock del decorador de verificación de roles"""
    with patch('apps.inventario.decorators.verificar_roles') as mock:
        mock.return_value = lambda func: func
        yield mock


@pytest.fixture
def mock_validar_rol_informacion():
    """Mock de validación de rol para app informacion"""
    with patch('apps.informacion.permissions.verificarToken.validarRol') as mock:
        mock.return_value = True
        yield mock


@pytest.fixture
def mock_obtener_uid_informacion():
    """Mock para obtener UID en app informacion"""
    with patch('apps.informacion.permissions.verificarToken.obtenerUID') as mock:
        mock.return_value = 'test_uid_123'
        yield mock


@pytest.fixture
def mock_firebase_auth():
    """Mock de Firebase Auth"""
    with patch('firebase_admin.auth') as mock:
        mock_user = MagicMock()
        mock_user.uid = 'firebase_test_uid'
        mock.create_user.return_value = mock_user
        yield mock


@pytest.fixture
def mock_asignar_rol_firebase():
    """Mock del servicio de asignación de rol en Firebase"""
    with patch('apps.usuarios_roles.services.asignar_rol_firebase') as mock:
        mock.return_value = None
        yield mock


# ==============================================
# FIXTURES DE CONFIGURACIÓN
# ==============================================

@pytest.fixture
def mock_r2_bucket_path():
    """Mock de la configuración de R2 bucket path"""
    with override_settings(R2_BUCKET_PATH='https://test-bucket.r2.dev'):
        yield


@pytest.fixture
def mock_r2_bucket_files_path():
    """Mock de la configuración de R2 bucket files path"""
    with override_settings(R2_BUCKET_FILES_PATH='https://test-bucket-files.r2.dev'):
        yield


@pytest.fixture
def mock_r2_client():
    """Mock del cliente S3/R2 de Cloudflare"""
    with patch('backend.serviceCloudflare.R2Client.s3') as mock:
        mock.delete_object.return_value = None
        mock.put_object.return_value = None
        yield mock


# ==============================================
# CONFIGURACIÓN DE TESTS
# ==============================================

@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db):
    """
    Habilita el acceso a la base de datos para todos los tests automáticamente.
    Si prefieres control manual, elimina 'autouse=True'.
    """
    pass


@pytest.fixture
def disable_migrations():
    """Deshabilita las migraciones para tests más rápidos"""
    settings_dict = {
        'MIGRATION_MODULES': {
            'informacion': None,
            'inventario': None,
            'usuarios_roles': None,
        }
    }
    with override_settings(**settings_dict):
        yield


# ==============================================
# FIXTURES DE DATOS DE PRUEBA
# ==============================================

@pytest.fixture
def sample_noticia_data():
    """Datos de ejemplo para crear una noticia"""
    return {
        'titulo': 'Noticia de prueba',
        'contenido': 'Este es el contenido de la noticia de prueba',
    }


@pytest.fixture
def sample_inventario_data():
    """Datos de ejemplo para crear un item de inventario"""
    return {
        'descripcion': 'Item de prueba',
        'estado_fisico': 'Excelente',
        'estado_admin': 'Disponible',
        'observacion': 'Observación de prueba'
    }


@pytest.fixture
def sample_usuario_data():
    """Datos de ejemplo para crear un usuario"""
    return {
        'email': 'test@example.com',
        'contrasena': 'password123',
        'nombre': 'Test',
        'apellido': 'Usuario',
        'rol': 'admin'
    }


# ==============================================
# HOOKS DE PYTEST
# ==============================================

def pytest_configure(config):
    """
    Configuración inicial de pytest.
    Se ejecuta antes de recolectar los tests.
    """
    # Puedes agregar configuraciones adicionales aquí
    pass


def pytest_collection_modifyitems(config, items):
    """
    Modifica los items recolectados antes de ejecutar los tests.
    Útil para agregar marcadores automáticos.
    """
    for item in items:
        # Agregar marcador 'unit' a todos los tests que no tengan otros marcadores
        if not any(marker.name in ['integration', 'slow', 'api'] for marker in item.iter_markers()):
            item.add_marker(pytest.mark.unit)
