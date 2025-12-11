# Guía de Pruebas Unitarias - Backend IoTic

## Descripción

Este proyecto incluye pruebas unitarias completas para las tres aplicaciones principales del backend:
- **informacion**: Tests para noticias y contenido
- **inventario**: Tests para gestión de inventario y préstamos
- **usuarios_roles**: Tests para gestión de usuarios y roles

## Instalación

### 1. Instalar dependencias de testing

```bash
pip install -r requirements-test.txt
```

## Ejecutar Tests

### Ejecutar todos los tests
```bash
pytest
```

### Ejecutar tests de una app específica
```bash
# Tests de informacion
pytest apps/informacion/tests.py

# Tests de inventario
pytest apps/inventario/tests.py

# Tests de usuarios_roles
pytest apps/usuarios_roles/tests.py
```

### Ejecutar tests con cobertura
```bash
pytest --cov=apps --cov-report=html
```

El reporte HTML se generará en `htmlcov/index.html`

### Ejecutar tests por marcadores
```bash
# Solo tests unitarios
pytest -m unit

# Solo tests de integración
pytest -m integration

# Solo tests de modelos
pytest -m models

# Solo tests de vistas/API
pytest -m api
```

### Ejecutar tests verbose
```bash
pytest -v
```

### Ejecutar un test específico
```bash
pytest apps/informacion/tests.py::NoticiaModelTest::test_crear_noticia
```

### Ejecutar tests adicionales (cobertura extendida)
```bash
# Tests adicionales de inventario
pytest apps/inventario/tests_adicionales.py

# Tests adicionales de usuarios_roles
pytest apps/usuarios_roles/tests_adicionales.py

# Tests adicionales de informacion
pytest apps/informacion/tests_adicionales.py

# Todos los tests (principales + adicionales)
pytest apps/
```

## Estructura de Tests

### Tests Principales

#### apps/informacion/tests.py
- **NoticiaModelTest**: Tests del modelo Noticia
- **NoticiaSerializerTest**: Tests del serializador
- **NoticiaViewSetTest**: Tests de endpoints de API
- **IntegrationNoticiaTest**: Tests de integración

#### apps/informacion/tests_adicionales.py
- **NoticiaEliminacionTest**: Tests de eliminación de noticias
- **NoticiaConArchivoTest**: Tests de manejo de archivos en R2
- **NoticiaBusquedaFiltroTest**: Tests de búsqueda y filtrado
- **NoticiaValidacionesTest**: Validaciones especiales
- **NoticiaFechaTest**: Tests de fechas
- **NoticiaMultiplesUsuariosTest**: Tests con múltiples usuarios

#### apps/inventario/tests.py

### apps/informacion/tests.py
- **NoticiaModelTest**: Tests del modelo Noticia
- **NoticiaSerializerTest**: Tests del serializador
- **NoticiaViewSetTest**: Tests de endpoints de API
- **IntegrationNoticiaTest**: Tests de integración

### apps/inventario/tests.py
- **InventarioModelTest**: Tests del modelo Inventario
- **PrestamoModelTest**: Tests del modelo Préstamo
- **InventarioSerializerTest**: Tests de serializadores de inventario
- **PrestamoSerializerTest**: Tests de serializadores de préstamos
- **InventarioViewSetTest**: Tests de endpoints de inventario
- **PrestamoViewSetTest**: Tests de endpoints de préstamos
- **IntegrationInventarioTest**: Tests de integración

#### apps/inventario/tests_adicionales.py
- **InventarioServiceTest**: Tests del servicio crear_items_masivo
- **PrestamoServiceTest**: Tests de servicios de préstamo (registrar, devolver)
- **InventarioBulkViewSetTest**: Tests de creación masiva vía API
- **InventarioFiltroTest**: Tests de filtrado y búsqueda
- **PrestamoEstadoTest**: Tests de validaciones de estado
- **InventarioDeleteTest**: Tests de eliminación

#### apps/usuarios_roles/tests.py
- **RolModelTest**: Tests del modelo Rol
- **UsuarioModelTest**: Tests del modelo Usuario
- **UsuarioSerializerTest**: Tests de serializadores de usuario
- **RolSerializerTest**: Tests de serializadores de rol
- **UsuarioViewTest**: Tests de endpoints de usuarios
- **IntegrationUsuarioTest**: Tests de integración
- **UsuarioRolRelationshipTest**: Tests de relaciones

#### apps/usuarios_roles/tests_adicionales.py
- **UsuarioServiceTest**: Tests del servicio crear_usuario
- **UsuarioValidacionTest**: Tests de validaciones de usuario
- **UsuarioActualizacionTest**: Tests de actualización de usuarios
- **RolPermisosTest**: Tests de permisos y roles
- **UsuarioIntegracionTest**: Tests de integración complejos
- **UsuarioDesactivacionTest**: Tests de desactivación de usuarios

## Configuración

### pytest.ini
Configuración principal de pytest con:
- Configuración de Django
- Opciones de cobertura
- Marcadores personalizados
- Filtros de warnings

### conftest.py
Fixtures compartidos:
- Fixtures de base de datos (usuarios, roles)
- Mocks de autenticación (Firebase, tokens)
- Mocks de servicios externos (R2/Cloudflare)
- Datos de prueba reutilizables

## Cobertura de Tests

Los tests cubren:
- Modelos (creación, validaciones, relaciones)
- Serializadores (validación de datos)
- Vistas/Endpoints (CRUD completo)
- Autenticación y autorización
- Manejo de errores
- Integración entre componentes
- Servicios (crear_items_masivo, registrar_prestamo, crear_usuario)
- Operaciones bulk (creación masiva)
- Búsqueda y filtrado
- Manejo de archivos en R2/Cloudflare
- Casos edge y validaciones complejas

## Resumen de Cobertura

### Tests Principales (130+ tests)
- Modelos: 25+ tests
- Serializadores: 20+ tests
- Vistas/API: 45+ tests
- Integración: 15+ tests
- Permisos y validaciones: 25+ tests

### Tests Adicionales (150+ tests)
- Servicios: 30+ tests
- Operaciones bulk: 15+ tests
- Búsqueda y filtrado: 20+ tests
- Eliminación: 15+ tests
- Validaciones especiales: 40+ tests
- Casos edge: 30+ tests

**TOTAL: 280+ tests de cobertura**

## Buenas Prácticas Implementadas

1. **Aislamiento**: Cada test es independiente
2. **Mocking**: Servicios externos (Firebase, R2) son mockeados
3. **Fixtures**: Datos de prueba reutilizables
4. **Organización**: Tests agrupados por funcionalidad
5. **Nomenclatura**: Nombres descriptivos (test_crear_usuario_exitoso)
6. **Cobertura**: Tests para casos exitosos y errores
7. **Documentación**: Docstrings en cada test

## Debugging Tests

### Ver output completo
```bash
pytest -v -s
```

### Detener en el primer error
```bash
pytest -x
```

### Ver traceback completo
```bash
pytest --tb=long
```

### Modo de depuración interactivo
```bash
pytest --pdb
```

## Ejemplo de Uso

```python
# Ejecutar todos los tests
pytest

# Ejecutar con cobertura y ver reporte
pytest --cov=apps --cov-report=term-missing

# Ejecutar solo tests rápidos (sin integration/slow)
pytest -m "not slow and not integration"

# Ejecutar y generar reporte HTML
pytest --cov=apps --cov-report=html
open htmlcov/index.html  # En Linux/Mac
start htmlcov/index.html  # En Windows
```

## Tests Implementados por Funcionalidad

### Modelos
- Creación de objetos
- Validación de campos únicos
- Valores por defecto
- Relaciones entre modelos
- Representación string

### Serializadores
- Datos válidos
- Validación de campos requeridos
- Validación de formatos (email, etc.)
- Serialización y deserialización

### Vistas/API
- Creación (POST)
- Lectura (GET)
- Actualización (PUT/PATCH)
- Eliminación (DELETE)
- Autenticación y permisos
- Manejo de errores (404, 400, 403)

### Integración
- Flujos completos de usuario
- Interacción entre apps
- Persistencia de datos

## Troubleshooting

### Error: "django.core.exceptions.ImproperlyConfigured"
Asegúrate de tener configurado DJANGO_SETTINGS_MODULE:
```bash
export DJANGO_SETTINGS_MODULE=backend.settings
```

### Error: "No module named 'pytest'"
Instala las dependencias de test:
```bash
pip install -r requirements-test.txt
```

### Tests lentos
Usa pytest-xdist para ejecutar en paralelo:
```bash
pip install pytest-xdist
pytest -n auto
```

## Recursos

- [Pytest Documentation](https://docs.pytest.org/)
- [Django Testing](https://docs.djangoproject.com/en/stable/topics/testing/)
- [DRF Testing](https://www.django-rest-framework.org/api-guide/testing/)
- [pytest-django](https://pytest-django.readthedocs.io/)

## Contribuir

Al agregar nuevas funcionalidades:
1. Escribe tests primero (TDD)
2. Asegura >80% de cobertura
3. Usa fixtures existentes cuando sea posible
4. Documenta tests complejos
5. Ejecuta todos los tests antes de commit

---

**Autor**: Backend Team IoTic  
**Última actualización**: Diciembre 2025
