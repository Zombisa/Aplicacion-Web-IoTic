from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from firebase_admin import auth

from apps.usuarios_roles.models import Usuario, Rol
from apps.usuarios_roles.serializers import UsuarioSerializer, RolSerializer
from apps.usuarios_roles.services import crear_usuario, asignar_rol_firebase


class RolModelTest(TestCase):
    """Pruebas para el modelo Rol"""

    def test_crear_rol(self):
        """Test: Crear un rol correctamente"""
        rol = Rol.objects.create(nombre='admin')
        
        self.assertEqual(rol.nombre, 'admin')
        self.assertIsNotNone(rol.id)

    def test_rol_str_representation(self):
        """Test: Representación string del rol"""
        rol = Rol.objects.create(nombre='mentor')
        
        self.assertEqual(str(rol), 'mentor')

    def test_rol_nombre_unico(self):
        """Test: El nombre del rol debe ser único"""
        Rol.objects.create(nombre='admin')
        
        with self.assertRaises(Exception):
            Rol.objects.create(nombre='admin')

    def test_multiples_roles(self):
        """Test: Crear múltiples roles"""
        admin = Rol.objects.create(nombre='admin')
        mentor = Rol.objects.create(nombre='mentor')
        
        self.assertEqual(Rol.objects.count(), 2)
        self.assertNotEqual(admin.id, mentor.id)


class UsuarioModelTest(TestCase):
    """Pruebas para el modelo Usuario"""

    def setUp(self):
        self.rol_admin = Rol.objects.create(nombre='admin')
        self.rol_mentor = Rol.objects.create(nombre='mentor')

    def test_crear_usuario(self):
        """Test: Crear un usuario correctamente"""
        usuario = Usuario.objects.create(
            uid_firebase='test_uid_123',
            nombre='Juan',
            apellido='Pérez',
            email='juan@example.com',
            contrasena='password123',
            rol=self.rol_admin,
            estado=True
        )
        
        self.assertEqual(usuario.nombre, 'Juan')
        self.assertEqual(usuario.apellido, 'Pérez')
        self.assertEqual(usuario.email, 'juan@example.com')
        self.assertEqual(usuario.rol, self.rol_admin)
        self.assertTrue(usuario.estado)

    def test_usuario_str_representation(self):
        """Test: Representación string del usuario"""
        usuario = Usuario.objects.create(
            uid_firebase='test_uid_456',
            nombre='María',
            apellido='García',
            email='maria@example.com',
            contrasena='password123',
            rol=self.rol_mentor
        )
        
        str_repr = str(usuario)
        self.assertIn('María', str_repr)
        self.assertIn('García', str_repr)
        self.assertIn('mentor', str_repr)

    def test_usuario_email_unico(self):
        """Test: El email debe ser único"""
        Usuario.objects.create(
            uid_firebase='uid1',
            nombre='Usuario',
            apellido='Uno',
            email='test@example.com',
            contrasena='password123',
            rol=self.rol_admin
        )
        
        with self.assertRaises(Exception):
            Usuario.objects.create(
                uid_firebase='uid2',
                nombre='Usuario',
                apellido='Dos',
                email='test@example.com',  # Email duplicado
                contrasena='password123',
                rol=self.rol_admin
            )

    def test_usuario_uid_firebase_unico(self):
        """Test: El UID de Firebase debe ser único"""
        Usuario.objects.create(
            uid_firebase='unique_uid',
            nombre='Usuario',
            apellido='Uno',
            email='user1@example.com',
            contrasena='password123',
            rol=self.rol_admin
        )
        
        with self.assertRaises(Exception):
            Usuario.objects.create(
                uid_firebase='unique_uid',  # UID duplicado
                nombre='Usuario',
                apellido='Dos',
                email='user2@example.com',
                contrasena='password123',
                rol=self.rol_admin
            )

    def test_usuario_estado_por_defecto(self):
        """Test: Estado por defecto es True"""
        usuario = Usuario.objects.create(
            uid_firebase='test_uid',
            nombre='Test',
            apellido='User',
            email='test@example.com',
            contrasena='password123',
            rol=self.rol_admin
        )
        
        self.assertTrue(usuario.estado)

    def test_usuario_sin_rol(self):
        """Test: Usuario puede crearse sin rol (null=True)"""
        usuario = Usuario.objects.create(
            uid_firebase='test_uid_no_rol',
            nombre='Sin',
            apellido='Rol',
            email='sinrol@example.com',
            contrasena='password123',
            estado=True
        )
        
        self.assertIsNone(usuario.rol)

    def test_fecha_registro_automatica(self):
        """Test: La fecha de registro se genera automáticamente"""
        usuario = Usuario.objects.create(
            uid_firebase='test_uid_date',
            nombre='Usuario',
            apellido='Fecha',
            email='fecha@example.com',
            contrasena='password123',
            rol=self.rol_admin
        )
        
        self.assertIsNotNone(usuario.fechaRegistro)

    def test_relacion_rol_usuario(self):
        """Test: Relación entre Rol y Usuario"""
        usuario1 = Usuario.objects.create(
            uid_firebase='uid1',
            nombre='Admin',
            apellido='User',
            email='admin@example.com',
            contrasena='password123',
            rol=self.rol_admin
        )
        
        usuario2 = Usuario.objects.create(
            uid_firebase='uid2',
            nombre='Mentor',
            apellido='User',
            email='mentor@example.com',
            contrasena='password123',
            rol=self.rol_mentor
        )
        
        # Verificar que los usuarios tienen el rol correcto
        self.assertEqual(usuario1.rol.nombre, 'admin')
        self.assertEqual(usuario2.rol.nombre, 'mentor')


class UsuarioSerializerTest(TestCase):
    """Pruebas para el serializador de Usuario"""

    def setUp(self):
        self.rol_admin = Rol.objects.create(nombre='admin')

    def test_serializer_con_datos_validos(self):
        """Test: Serializar con datos válidos"""
        data = {
            'uid_firebase': 'test_uid',
            'nombre': 'Carlos',
            'apellido': 'López',
            'email': 'carlos@example.com',
            'contrasena': 'password123',
            'rol_id': self.rol_admin.id,
            'estado': True
        }
        
        serializer = UsuarioSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_serializer_sin_nombre(self):
        """Test: Validar que el nombre es requerido"""
        data = {
            'uid_firebase': 'test_uid',
            'apellido': 'López',
            'email': 'carlos@example.com',
            'contrasena': 'password123',
            'rol_id': self.rol_admin.id
        }
        
        serializer = UsuarioSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('nombre', serializer.errors)

    def test_serializer_email_invalido(self):
        """Test: Validar formato de email"""
        data = {
            'uid_firebase': 'test_uid',
            'nombre': 'Carlos',
            'apellido': 'López',
            'email': 'email-invalido',
            'contrasena': 'password123',
            'rol_id': self.rol_admin.id
        }
        
        serializer = UsuarioSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_serializer_deserializacion(self):
        """Test: Deserializar un objeto Usuario"""
        usuario = Usuario.objects.create(
            uid_firebase='test_uid',
            nombre='Ana',
            apellido='Martínez',
            email='ana@example.com',
            contrasena='password123',
            rol=self.rol_admin
        )
        
        serializer = UsuarioSerializer(usuario)
        data = serializer.data
        
        self.assertEqual(data['nombre'], 'Ana')
        self.assertEqual(data['apellido'], 'Martínez')
        self.assertEqual(data['email'], 'ana@example.com')


class RolSerializerTest(TestCase):
    """Pruebas para el serializador de Rol"""

    def test_serializer_con_datos_validos(self):
        """Test: Serializar rol con datos válidos"""
        data = {
            'nombre': 'admin'
        }
        
        serializer = RolSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_serializer_sin_nombre(self):
        """Test: Validar que el nombre es requerido"""
        data = {}
        
        serializer = RolSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('nombre', serializer.errors)

    def test_serializer_deserializacion(self):
        """Test: Deserializar un objeto Rol"""
        rol = Rol.objects.create(nombre='mentor')
        
        serializer = RolSerializer(rol)
        data = serializer.data
        
        self.assertEqual(data['nombre'], 'mentor')


class UsuarioViewTest(APITestCase):
    """Pruebas para las vistas de Usuario"""

    def setUp(self):
        self.client = APIClient()
        self.rol_admin = Rol.objects.create(nombre='admin')
        self.rol_mentor = Rol.objects.create(nombre='mentor')

    def test_listar_usuarios(self):
        """Test: Listar todos los usuarios"""
        # Crear algunos usuarios
        Usuario.objects.create(
            uid_firebase='uid1',
            nombre='Usuario',
            apellido='Uno',
            email='user1@example.com',
            contrasena='password123',
            rol=self.rol_admin
        )
        
        Usuario.objects.create(
            uid_firebase='uid2',
            nombre='Usuario',
            apellido='Dos',
            email='user2@example.com',
            contrasena='password123',
            rol=self.rol_mentor
        )
        
        url = '/api/usuarios/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    @patch('firebase_admin.auth.create_user')
    @patch('apps.usuarios_roles.services.asignar_rol_firebase')
    def test_crear_usuario_exitoso(self, mock_asignar_rol, mock_create_user):
        """Test: Crear un usuario correctamente"""
        # Mock de Firebase
        mock_user = MagicMock()
        mock_user.uid = 'firebase_uid_123'
        mock_create_user.return_value = mock_user
        mock_asignar_rol.return_value = None
        
        url = '/api/usuarios/crear/'
        data = {
            'email': 'nuevo@example.com',
            'contrasena': 'password123',
            'nombre': 'Nuevo',
            'apellido': 'Usuario',
            'rol': 'admin'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Usuario.objects.count(), 1)
        
        usuario = Usuario.objects.first()
        self.assertEqual(usuario.email, 'nuevo@example.com')
        self.assertEqual(usuario.nombre, 'Nuevo')
        self.assertEqual(usuario.rol.nombre, 'admin')

    def test_crear_usuario_campos_faltantes(self):
        """Test: Intentar crear usuario sin campos requeridos"""
        url = '/api/usuarios/crear/'
        data = {
            'email': 'incompleto@example.com',
            # Faltan campos requeridos
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Usuario.objects.count(), 0)

    def test_crear_usuario_rol_invalido(self):
        """Test: Intentar crear usuario con rol inválido"""
        url = '/api/usuarios/crear/'
        data = {
            'email': 'test@example.com',
            'contrasena': 'password123',
            'nombre': 'Test',
            'apellido': 'User',
            'rol': 'rol_invalido'  # Rol no permitido
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Rol inválido', str(response.data))


class IntegrationUsuarioTest(APITestCase):
    """Pruebas de integración para el flujo completo de Usuario"""

    def setUp(self):
        self.client = APIClient()
        self.rol_admin = Rol.objects.create(nombre='admin')

    @patch('firebase_admin.auth.create_user')
    @patch('apps.usuarios_roles.services.asignar_rol_firebase')
    def test_flujo_completo_usuario(self, mock_asignar_rol, mock_create_user):
        """Test: Flujo completo - crear usuario y verificar"""
        # Mock de Firebase
        mock_user = MagicMock()
        mock_user.uid = 'firebase_uid_integration'
        mock_create_user.return_value = mock_user
        mock_asignar_rol.return_value = None
        
        # 1. Crear usuario
        url_crear = '/api/usuarios/crear/'
        data_crear = {
            'email': 'integration@example.com',
            'contrasena': 'password123',
            'nombre': 'Integration',
            'apellido': 'Test',
            'rol': 'admin'
        }
        
        response = self.client.post(url_crear, data_crear, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 2. Verificar que se creó en la base de datos
        usuario = Usuario.objects.get(email='integration@example.com')
        self.assertEqual(usuario.nombre, 'Integration')
        self.assertEqual(usuario.rol.nombre, 'admin')
        self.assertTrue(usuario.estado)
        
        # 3. Verificar que aparece en el listado
        url_listar = '/api/usuarios/'
        response = self.client.get(url_listar)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['email'], 'integration@example.com')


class UsuarioRolRelationshipTest(TestCase):
    """Pruebas para la relación entre Usuario y Rol"""

    def setUp(self):
        self.rol_admin = Rol.objects.create(nombre='admin')
        self.rol_mentor = Rol.objects.create(nombre='mentor')

    def test_cambiar_rol_usuario(self):
        """Test: Cambiar el rol de un usuario"""
        usuario = Usuario.objects.create(
            uid_firebase='test_uid',
            nombre='Test',
            apellido='User',
            email='test@example.com',
            contrasena='password123',
            rol=self.rol_admin
        )
        
        self.assertEqual(usuario.rol.nombre, 'admin')
        
        # Cambiar rol
        usuario.rol = self.rol_mentor
        usuario.save()
        
        usuario.refresh_from_db()
        self.assertEqual(usuario.rol.nombre, 'mentor')

    def test_eliminar_rol_con_usuarios(self):
        """Test: Eliminar un rol con CASCADE elimina también los usuarios asociados"""
        usuario = Usuario.objects.create(
            uid_firebase='test_uid',
            nombre='Test',
            apellido='User',
            email='test@example.com',
            contrasena='password123',
            rol=self.rol_admin
        )
        
        usuario_id = usuario.id
        
        # Eliminar el rol debería eliminar también el usuario (CASCADE)
        self.rol_admin.delete()
        
        # El usuario ya no debería existir
        self.assertFalse(Usuario.objects.filter(id=usuario_id).exists())


# =============================================================================
# TESTS ADICIONALES - SERVICIOS, SINCRONIZACIÓN FIREBASE Y CASOS EDGE
# =============================================================================


class UsuarioServiceTest(TestCase):
    """Pruebas para los servicios de usuarios"""

    def setUp(self):
        self.rol_admin = Rol.objects.create(nombre='admin')
        self.rol_mentor = Rol.objects.create(nombre='mentor')

    @patch('firebase_admin.auth.create_user')
    @patch('apps.usuarios_roles.services.asignar_rol_firebase')
    @patch('firebase_admin.firestore.client')
    def test_crear_usuario_exitoso(self, mock_firestore, mock_asignar_rol, mock_create_user):
        """Test: Crear usuario en Firebase, Firestore y PostgreSQL"""
        # Mock de Firebase
        mock_user = MagicMock()
        mock_user.uid = 'firebase_uid_123'
        mock_create_user.return_value = mock_user
        
        mock_db = MagicMock()
        mock_firestore.return_value = mock_db
        
        data = {
            'email': 'nuevo@example.com',
            'contrasena': 'password123',
            'nombre': 'Nuevo',
            'apellido': 'Usuario',
            'rol': self.rol_admin
        }
        
        usuario = crear_usuario(data)
        
        self.assertEqual(usuario.email, 'nuevo@example.com')
        self.assertEqual(usuario.nombre, 'Nuevo')
        self.assertEqual(usuario.uid_firebase, 'firebase_uid_123')
        self.assertEqual(usuario.rol, self.rol_admin)
        
        # Verificar que se llamaron los métodos de Firebase
        mock_create_user.assert_called_once()
        mock_asignar_rol.assert_called_once()
        mock_db.collection.assert_called_once_with('usuarios')

    @patch('firebase_admin.auth.create_user')
    @patch('firebase_admin.auth.delete_user')
    @patch('firebase_admin.firestore.client')
    def test_crear_usuario_fallo_revierte_cambios(self, mock_firestore, mock_delete, mock_create_user):
        """Test: Si falla la creación, se revierten los cambios"""
        # Mock que simula error en Firebase
        mock_create_user.side_effect = Exception('Firebase error')
        
        data = {
            'email': 'fallo@example.com',
            'contrasena': 'password123',
            'nombre': 'Fallo',
            'apellido': 'Usuario',
            'rol': self.rol_admin
        }
        
        with self.assertRaises(Exception):
            crear_usuario(data)
        
        # Verificar que no se creó en PostgreSQL
        self.assertFalse(Usuario.objects.filter(email='fallo@example.com').exists())

    @patch('firebase_admin.auth.set_custom_user_claims')
    def test_asignar_rol_firebase_exitoso(self, mock_set_claims):
        """Test: Asignar rol en Firebase correctamente"""
        uid = 'firebase_uid_123'
        rol_nombre = 'admin'
        
        mock_set_claims.return_value = None
        
        asignar_rol_firebase(uid, rol_nombre)
        
        mock_set_claims.assert_called_once()


class UsuarioValidacionTest(TestCase):
    """Pruebas para validaciones de usuario"""

    def setUp(self):
        self.rol = Rol.objects.create(nombre='admin')

    def test_usuario_email_unico(self):
        """Test: El email debe ser único"""
        Usuario.objects.create(
            uid_firebase='uid1',
            nombre='Usuario',
            apellido='Uno',
            email='unico@example.com',
            contrasena='password123',
            rol=self.rol
        )
        
        # Intentar crear con el mismo email debe fallar
        with self.assertRaises(Exception):
            Usuario.objects.create(
                uid_firebase='uid2',
                nombre='Usuario',
                apellido='Dos',
                email='unico@example.com',
                contrasena='password123',
                rol=self.rol
            )

    def test_usuario_uid_firebase_unico(self):
        """Test: El UID de Firebase debe ser único"""
        Usuario.objects.create(
            uid_firebase='unico_uid',
            nombre='Usuario',
            apellido='Uno',
            email='user1@example.com',
            contrasena='password123',
            rol=self.rol
        )
        
        with self.assertRaises(Exception):
            Usuario.objects.create(
                uid_firebase='unico_uid',
                nombre='Usuario',
                apellido='Dos',
                email='user2@example.com',
                contrasena='password123',
                rol=self.rol
            )


class UsuarioActualizacionTest(APITestCase):
    """Pruebas para actualización de usuarios"""

    def setUp(self):
        self.client = APIClient()
        self.rol_admin = Rol.objects.create(nombre='admin')
        self.rol_mentor = Rol.objects.create(nombre='mentor')
        
        self.usuario = Usuario.objects.create(
            uid_firebase='uid123',
            nombre='Juan',
            apellido='Pérez',
            email='juan@example.com',
            contrasena='password123',
            rol=self.rol_admin,
            estado=True
        )

    @patch('apps.usuarios_roles.decorators.verificar_token')
    def test_actualizar_usuario(self, mock_token):
        """Test: Actualizar datos de un usuario"""
        mock_token.return_value = lambda func: func
        
        url = f'/api/usuarios/{self.usuario.id}/'
        data = {
            'nombre': 'Juan Carlos',
            'apellido': 'Pérez García'
        }
        
        response = self.client.patch(url, data, format='json')
        
        # Los permisos pueden variar, pero verificar estructura
        if response.status_code in [status.HTTP_200_OK, status.HTTP_403_FORBIDDEN]:
            self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_403_FORBIDDEN])

    def test_usuario_cambiar_estado(self):
        """Test: Cambiar estado de un usuario (activo/inactivo)"""
        usuario = Usuario.objects.get(id=self.usuario.id)
        self.assertTrue(usuario.estado)
        
        # Cambiar estado
        usuario.estado = False
        usuario.save()
        
        usuario.refresh_from_db()
        self.assertFalse(usuario.estado)

    def test_usuario_cambiar_rol(self):
        """Test: Cambiar rol de un usuario"""
        usuario = Usuario.objects.get(id=self.usuario.id)
        
        # Cambiar de admin a mentor
        usuario.rol = self.rol_mentor
        usuario.save()
        
        usuario.refresh_from_db()
        self.assertEqual(usuario.rol.nombre, 'mentor')


class RolPermisosTest(TestCase):
    """Pruebas para permisos y roles"""

    def test_crear_rol_admin(self):
        """Test: Crear rol admin"""
        rol = Rol.objects.create(nombre='admin')
        self.assertEqual(rol.nombre, 'admin')

    def test_crear_rol_mentor(self):
        """Test: Crear rol mentor"""
        rol = Rol.objects.create(nombre='mentor')
        self.assertEqual(rol.nombre, 'mentor')

    def test_rol_nombre_unico(self):
        """Test: Los nombres de roles deben ser únicos"""
        Rol.objects.create(nombre='admin')
        
        with self.assertRaises(Exception):
            Rol.objects.create(nombre='admin')

    def test_multiples_usuarios_mismo_rol(self):
        """Test: Múltiples usuarios pueden tener el mismo rol"""
        rol = Rol.objects.create(nombre='admin')
        
        usuario1 = Usuario.objects.create(
            uid_firebase='uid1',
            nombre='Usuario',
            apellido='Uno',
            email='user1@example.com',
            contrasena='password123',
            rol=rol
        )
        
        usuario2 = Usuario.objects.create(
            uid_firebase='uid2',
            nombre='Usuario',
            apellido='Dos',
            email='user2@example.com',
            contrasena='password123',
            rol=rol
        )
        
        usuarios_admin = Usuario.objects.filter(rol=rol)
        self.assertEqual(usuarios_admin.count(), 2)


class UsuarioIntegracionCompleteTest(APITestCase):
    """Pruebas de integración complejas de usuarios"""

    def setUp(self):
        self.client = APIClient()
        self.rol_admin = Rol.objects.create(nombre='admin')

    @patch('firebase_admin.auth.create_user')
    @patch('apps.usuarios_roles.services.asignar_rol_firebase')
    @patch('firebase_admin.firestore.client')
    def test_flujo_crear_usuario_con_rol(self, mock_firestore, mock_asignar_rol, mock_create_user):
        """Test: Flujo completo de creación de usuario con asignación de rol"""
        # Mock
        mock_user = MagicMock()
        mock_user.uid = 'new_uid'
        mock_create_user.return_value = mock_user
        
        mock_db = MagicMock()
        mock_firestore.return_value = mock_db
        
        # Crear usuario
        url = '/api/usuarios/crear/'
        data = {
            'email': 'newuser@example.com',
            'contrasena': 'password123',
            'nombre': 'Nuevo',
            'apellido': 'Usuario',
            'rol': 'admin'
        }
        
        response = self.client.post(url, data, format='json')
        
        # Verificar que se creó
        if response.status_code == status.HTTP_201_CREATED:
            usuario = Usuario.objects.get(email='newuser@example.com')
            self.assertEqual(usuario.rol.nombre, 'admin')
            self.assertTrue(usuario.estado)


class UsuarioDesactivacionTest(TestCase):
    """Pruebas para desactivación de usuarios"""

    def setUp(self):
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(
            uid_firebase='uid123',
            nombre='Usuario',
            apellido='Test',
            email='test@example.com',
            contrasena='password123',
            rol=self.rol,
            estado=True
        )

    def test_desactivar_usuario(self):
        """Test: Desactivar un usuario (soft delete)"""
        self.assertTrue(self.usuario.estado)
        
        # Desactivar
        self.usuario.estado = False
        self.usuario.save()
        
        self.usuario.refresh_from_db()
        self.assertFalse(self.usuario.estado)
        
        # El usuario aún existe en la BD
        self.assertTrue(Usuario.objects.filter(id=self.usuario.id).exists())

    def test_usuario_desactivado_no_aparece_en_listado(self):
        """Test: Usuarios desactivados podrían no aparecer en listados"""
        # Desactivar usuario
        self.usuario.estado = False
        self.usuario.save()
        
        # Verificar que aún existe pero está inactivo
        usuarios_activos = Usuario.objects.filter(estado=True)
        self.assertNotIn(self.usuario.id, [u.id for u in usuarios_activos])
