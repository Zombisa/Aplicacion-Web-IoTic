from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from django.contrib.auth import get_user_model

from apps.usuarios_roles.models import Usuario, Rol
from apps.informacion.Models.Noticia import Noticia
from apps.informacion.Serializers.NoticiaSerializer import NoticiaSerializer
from apps.informacion.Models.Libro import Libro
from apps.informacion.Serializers.LibroSerializer import LibroSerializer
from apps.informacion.Models.Curso import Curso
from apps.informacion.Serializers.CursoSerializer import CursoSerializer
from apps.informacion.Models.Evento import Evento
from apps.informacion.Serializers.EventoSerializer import EventoSerializer
from apps.informacion.Models.Revista import Revista
from apps.informacion.Serializers.RevistaSerializer import RevistaSerializer
from apps.informacion.Models.CapLibro import CapLibro
from apps.informacion.Serializers.CapLibroSerializer import CapLibroSerializer
from apps.informacion.Models.MaterialDidactico import MaterialDidactico
from apps.informacion.Serializers.MaterialDidacticoSerializer import MaterialDidacticoSerializer
from apps.informacion.Models.Software import Software
from apps.informacion.Serializers.SoftwareSerializer import SoftwareSerializer
from apps.informacion.Models.TrabajoEventos import TrabajoEventos
from apps.informacion.Serializers.TrabajoEventosSerializer import TrabajoEventosSerializer
from apps.informacion.Models.TutoriaEnMarcha import TutoriaEnMarcha
from apps.informacion.Serializers.TutoriaEnMarchaSerializer import TutoriaEnMarchaSerializer
from apps.informacion.Models.TutoriaConcluida import TutoriaConcluida
from apps.informacion.Serializers.TutoriaConcluidaSerializer import TutoriaConcluidaSerializer
from apps.informacion.Models.ParticipacionComitesEv import ParticipacionComitesEv
from apps.informacion.Serializers.ParticipacionComitesEvSerializer import ParticipacionComitesEvSerializer
from apps.informacion.Models.ProcesoTecnica import ProcesoTecnica
from apps.informacion.Serializers.ProcesoTecnicaSerializer import ProcesoTecnicaSerializer
from apps.informacion.Models.RegistroFotografico import RegistroFotografico
from apps.informacion.Serializers.RegistroFotograficoSerializer import RegistroFotograficoSerializer
from apps.informacion.Models.Productividad import Mision, Vision, Historia, Objetivo, Valor


class NoticiaModelTest(TestCase):
    """Pruebas para el modelo Noticia"""

    def setUp(self):
        """Configuración inicial para cada test"""
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(
            uid_firebase='test_uid_123',
            nombre='Test',
            apellido='Usuario',
            email='test@example.com',
            contrasena='password123',
            rol=self.rol,
            estado=True
        )

    def test_crear_noticia(self):
        """Test: Crear una noticia correctamente"""
        noticia = Noticia.objects.create(
            titulo='Noticia de prueba',
            contenido='Este es el contenido de la noticia',
            usuario=self.usuario
        )
        
        self.assertEqual(noticia.titulo, 'Noticia de prueba')
        self.assertEqual(noticia.contenido, 'Este es el contenido de la noticia')
        self.assertEqual(noticia.usuario, self.usuario)
        self.assertIsNotNone(noticia.fecha_publicacion)

    def test_noticia_str_representation(self):
        """Test: Verificar la representación string del modelo"""
        noticia = Noticia.objects.create(
            titulo='Mi Noticia',
            contenido='Contenido',
            usuario=self.usuario
        )
        
        self.assertEqual(str(noticia), 'Mi Noticia')

    def test_noticia_con_imagen(self):
        """Test: Crear noticia con imagen en R2"""
        noticia = Noticia.objects.create(
            titulo='Noticia con imagen',
            contenido='Contenido',
            usuario=self.usuario,
            image_r2='https://bucket.r2.dev/imagen.jpg'
        )
        
        self.assertEqual(noticia.image_r2, 'https://bucket.r2.dev/imagen.jpg')

    def test_noticia_con_archivo(self):
        """Test: Crear noticia con archivo adjunto"""
        noticia = Noticia.objects.create(
            titulo='Noticia con archivo',
            contenido='Contenido',
            usuario=self.usuario,
            file_r2='https://bucket.r2.dev/documento.pdf'
        )
        
        self.assertEqual(noticia.file_r2, 'https://bucket.r2.dev/documento.pdf')


class NoticiaSerializerTest(TestCase):
    """Pruebas para el serializador de Noticia"""

    def setUp(self):
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(
            uid_firebase='test_uid_456',
            nombre='Test',
            apellido='Usuario',
            email='test2@example.com',
            contrasena='password123',
            rol=self.rol
        )

    def test_serializer_con_datos_validos(self):
        """Test: Serializar con datos válidos"""
        data = {
            'titulo': 'Nueva noticia',
            'contenido': 'Contenido de la noticia',
            'usuario': self.usuario.id
        }
        
        serializer = NoticiaSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_serializer_sin_titulo(self):
        """Test: Validar que el título es requerido"""
        data = {
            'contenido': 'Contenido de la noticia',
            'usuario': self.usuario.id
        }
        
        serializer = NoticiaSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('titulo', serializer.errors)

class LibroModelTest(TestCase):
    """Pruebas para el modelo Libro"""

    def setUp(self):
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(
            uid_firebase='user_libro', nombre='User', apellido='Libro',
            email='libro@example.com', contrasena='pass', rol=self.rol, estado=True
        )

    def test_crear_libro(self):
        libro = Libro.objects.create(
            usuario=self.usuario,
            titulo='Libro Test',
            tipoProductividad='Publicación',
            pais='Ecuador',
            anio=2024,
            isbn=123456,
            volumen=1,
            paginas=200,
            editorial='Editorial X',
            codigoEditorial='EDX-01',
            propiedadIntelectual='Derechos Reservados'
        )
        self.assertEqual(libro.titulo, 'Libro Test')

class LibroSerializerTest(TestCase):
    """Pruebas para el serializer de Libro"""

    def test_serializer_libro_valido(self):
        data = {
            'titulo': 'Libro A',
            'tipoProductividad': 'Publicación',
            'pais': 'Ecuador',
            'anio': 2023,
            'isbn': 987654,
            'volumen': 1,
            'paginas': 120,
            'editorial': 'Ed Y',
            'codigoEditorial': 'EDY-99',
            'propiedadIntelectual': 'Derechos Reservados'
        }
        serializer = LibroSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_serializer_libro_requiere_titulo(self):
        data = {'editorial': 'Ed Y'}
        serializer = LibroSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('titulo', serializer.errors)

class CursoModelTest(TestCase):
    """Pruebas para el modelo Curso"""

    def setUp(self):
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(
            uid_firebase='user_curso', nombre='User', apellido='Curso',
            email='curso@example.com', contrasena='pass', rol=self.rol, estado=True
        )

    def test_crear_curso(self):
        curso = Curso.objects.create(
            usuario=self.usuario,
            titulo='Curso Test',
            tipoProductividad='Formación',
            propiedadIntelectual='Certificado',
            duracion=20,
            institucion='Inst ABC'
        )
        self.assertEqual(curso.titulo, 'Curso Test')

class CursoSerializerTest(TestCase):
    """Pruebas para el serializer de Curso"""

    def test_serializer_curso_valido(self):
        data = {
            'titulo': 'Curso A',
            'tipoProductividad': 'Formación',
            'propiedadIntelectual': 'Certificado',
            'duracion': 10,
            'institucion': 'Inst XYZ'
        }
        serializer = CursoSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_serializer_curso_requiere_titulo(self):
        data = {'horas': 10}
        serializer = CursoSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('titulo', serializer.errors)

class EventoModelTest(TestCase):
    """Pruebas para el modelo Evento"""

    def setUp(self):
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(
            uid_firebase='user_evento', nombre='User', apellido='Evento',
            email='evento@example.com', contrasena='pass', rol=self.rol, estado=True
        )

    def test_crear_evento(self):
        evento = Evento.objects.create(
            usuario=self.usuario,
            titulo='Evento Test',
            tipoProductividad='Congreso',
            propiedadIntelectual='Ponencia',
            alcance='Nacional',
            institucion='Inst Evento'
        )
        self.assertEqual(evento.titulo, 'Evento Test')

class EventoSerializerTest(TestCase):
    """Pruebas para el serializer de Evento"""

    def test_serializer_evento_valido(self):
        data = {
            'titulo': 'Evento A',
            'tipoProductividad': 'Congreso',
            'propiedadIntelectual': 'Ponencia',
            'alcance': 'Internacional',
            'institucion': 'Inst XYZ'
        }
        serializer = EventoSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_serializer_evento_requiere_titulo(self):
        data = {'lugar': 'Sala 1'}
        serializer = EventoSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('titulo', serializer.errors)

class RevistaModelTest(TestCase):
    """Pruebas para el modelo Revista"""

    def setUp(self):
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(
            uid_firebase='user_revista', nombre='User', apellido='Revista',
            email='revista@example.com', contrasena='pass', rol=self.rol, estado=True
        )

    def test_crear_revista(self):
        revista = Revista.objects.create(
            usuario=self.usuario,
            titulo='Revista Test',
            issn=12345678,
            volumen=2,
            fasc=1,
            paginas=10
        )
        self.assertEqual(revista.titulo, 'Revista Test')

class RevistaSerializerTest(TestCase):
    """Pruebas para el serializer de Revista"""

    def test_serializer_revista_valido(self):
        data = {
            'titulo': 'Revista A',
            'issn': 12345678,
            'volumen': 1,
            'fasc': 1,
            'paginas': 8
        }
        serializer = RevistaSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_serializer_revista_requiere_titulo(self):
        data = {'issn': '0000-0000'}
        serializer = RevistaSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('titulo', serializer.errors)

class CapLibroModelTest(TestCase):
    """Pruebas para el modelo CapLibro"""

    def test_crear_capitulo_libro(self):
        rol = Rol.objects.create(nombre='admin')
        usuario = Usuario.objects.create(uid_firebase='cap_uid', nombre='Cap', apellido='User', email='cap@example.com', contrasena='pass', rol=rol, estado=True)
        cap = CapLibro.objects.create(
            usuario=usuario,
            titulo='Capítulo 1',
            tipoProductividad='Publicación',
            anio=2023,
            isbn=111111,
            volumen=1,
            paginaInicio=1,
            paginasFin=10,
            editorial='Ed X',
            codigoEditorial=100,
            propiedadIntelectual='Derechos'
        )
        self.assertEqual(cap.titulo, 'Capítulo 1')

class CapLibroSerializerTest(TestCase):
    """Pruebas para el serializer de CapLibro"""

    def test_serializer_caplibro_valido(self):
        data = {
            'titulo': 'Cap 1',
            'tipoProductividad': 'Publicación',
            'anio': 2022,
            'isbn': 222222,
            'volumen': 1,
            'paginaInicio': 5,
            'paginasFin': 15,
            'editorial': 'Ed Y',
            'codigoEditorial': 200,
            'propiedadIntelectual': 'Derechos'
        }
        serializer = CapLibroSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_serializer_caplibro_requiere_titulo(self):
        data = {'libro': 'Libro Y'}
        serializer = CapLibroSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('titulo', serializer.errors)

class MaterialDidacticoModelTest(TestCase):
    """Pruebas para el modelo MaterialDidactico"""

    def setUp(self):
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(
            uid_firebase='user_mat', nombre='User', apellido='Mat',
            email='mat@example.com', contrasena='pass', rol=self.rol, estado=True
        )

    def test_crear_material_didactico(self):
        mat = MaterialDidactico.objects.create(
            usuario=self.usuario,
            titulo='Guía 1',
            tipoProductividad='Material',
            pais='Ecuador',
            anio=2024,
            descripcion='Contenido breve',
            licencia='CC-BY'
        )
        self.assertEqual(mat.titulo, 'Guía 1')

class MaterialDidacticoSerializerTest(TestCase):
    """Pruebas para el serializer de MaterialDidactico"""

    def setUp(self):
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(
            uid_firebase='user_mat_s', nombre='User', apellido='MatS',
            email='mats@example.com', contrasena='pass', rol=self.rol, estado=True
        )

    def test_serializer_material_valido(self):
        data = {
            'titulo': 'Guía A',
            'tipoProductividad': 'Material',
            'pais': 'Ecuador',
            'anio': 2023,
            'descripcion': 'Contenido',
            'licencia': 'CC-BY'
        }
        serializer = MaterialDidacticoSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_serializer_material_requiere_titulo(self):
        data = {
            'tipoProductividad': 'Material',
            'pais': 'Ecuador',
            'anio': 2023,
            'descripcion': 'Contenido',
            'licencia': 'CC-BY'
        }
        serializer = MaterialDidacticoSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('titulo', serializer.errors)

class SoftwareModelTest(TestCase):
    """Pruebas para el modelo Software"""

    def setUp(self):
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(uid_firebase='soft_uid', nombre='Soft', apellido='User', email='soft@example.com', contrasena='pass', rol=self.rol, estado=True)

    def test_crear_software(self):
        sw = Software.objects.create(
            usuario=self.usuario,
            titulo='App X',
            tipoProductividad='Desarrollo',
            nivelAcceso='Público',
            tipoProducto='Web',
            pais='Ecuador',
            descripcionFuncional='Hace cosas',
            propiedadIntelectual='GPL'
        )
        self.assertEqual(sw.titulo, 'App X')

class SoftwareSerializerTest(TestCase):
    def test_serializer_software_valido(self):
        data = {
            'titulo': 'App Y',
            'tipoProductividad': 'Desarrollo',
            'nivelAcceso': 'Privado',
            'tipoProducto': 'API',
            'pais': 'Ecuador',
            'descripcionFuncional': 'API útil',
            'propiedadIntelectual': 'MIT'
        }
        serializer = SoftwareSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

class TrabajoEventosModelTest(TestCase):
    """Pruebas para el modelo TrabajoEventos"""

    def setUp(self):
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(uid_firebase='te_uid', nombre='TE', apellido='User', email='te@example.com', contrasena='pass', rol=self.rol, estado=True)

    def test_crear_trabajo_evento(self):
        te = TrabajoEventos.objects.create(
            usuario=self.usuario,
            titulo='Ponencia',
            tipoProductividad='Evento',
            volumen=1,
            nombreSeminario='Seminario X',
            tipoPresentacion='Poster',
            tituloActas='Actas X',
            isbn=123456,
            paginas=5,
            anio=2024,
            propiedadIntelectual='Derechos'
        )
        self.assertEqual(te.titulo, 'Ponencia')

class TrabajoEventosSerializerTest(TestCase):
    def test_serializer_trabajo_evento_valido(self):
        data = {
            'titulo': 'Ponencia',
            'tipoProductividad': 'Evento',
            'volumen': 1,
            'nombreSeminario': 'Seminario X',
            'tipoPresentacion': 'Poster',
            'tituloActas': 'Actas',
            'isbn': 123456,
            'paginas': 10,
            'anio': 2023,
            'propiedadIntelectual': 'Derechos'
        }
        serializer = TrabajoEventosSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

class TutoriaEnMarchaModelTest(TestCase):
    def setUp(self):
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(uid_firebase='tem_uid', nombre='TEM', apellido='User', email='tem@example.com', contrasena='pass', rol=self.rol, estado=True)

    def test_crear_tutoria_en_marcha(self):
        t = TutoriaEnMarcha.objects.create(
            usuario=self.usuario,
            titulo='Tutoría A',
            subtipoTitulo='Maestría',
            tipoProductividad='Tutoría',
            descripcion='Descripción',
            pais='Ecuador',
            anio=2024,
            programa='Programa X',
            institucion='Inst X',
            licencia='CC-BY'
        )
        self.assertEqual(t.titulo, 'Tutoría A')

class TutoriaEnMarchaSerializerTest(TestCase):
    def test_serializer_tutoria_en_marcha_valido(self):
        data = {
            'titulo': 'Tutoría B',
            'subtipoTitulo': 'Doctorado',
            'tipoProductividad': 'Tutoría',
            'descripcion': 'Desc',
            'pais': 'Ecuador',
            'anio': 2023,
            'programa': 'Programa Y',
            'institucion': 'Inst Y',
            'licencia': 'CC-BY'
        }
        serializer = TutoriaEnMarchaSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

class TutoriaConcluidaModelTest(TestCase):
    def setUp(self):
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(uid_firebase='tc_uid', nombre='TC', apellido='User', email='tc@example.com', contrasena='pass', rol=self.rol, estado=True)

    def test_crear_tutoria_concluida(self):
        t = TutoriaConcluida.objects.create(
            usuario=self.usuario,
            titulo='Tutoría C',
            tipoProductividad='Tutoría',
            pais='Ecuador',
            anio=2022,
            programa='Programa Z',
            institucion='Inst Z',
            licencia='CC-BY'
        )
        self.assertEqual(t.titulo, 'Tutoría C')

class TutoriaConcluidaSerializerTest(TestCase):
    def test_serializer_tutoria_concluida_valido(self):
        data = {
            'titulo': 'Tutoría D',
            'tipoProductividad': 'Tutoría',
            'pais': 'Ecuador',
            'anio': 2021,
            'programa': 'Programa W',
            'institucion': 'Inst W',
            'licencia': 'CC-BY'
        }
        serializer = TutoriaConcluidaSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

class ParticipacionComitesEvModelTest(TestCase):
    def setUp(self):
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(uid_firebase='pce_uid', nombre='PCE', apellido='User', email='pce@example.com', contrasena='pass', rol=self.rol, estado=True)

    def test_crear_participacion(self):
        p = ParticipacionComitesEv.objects.create(
            usuario=self.usuario,
            titulo='Participación',
            pais='Ecuador',
            anio=2024,
            institucion='Inst P',
            tipoProductividad='Comité',
            licencia='CC-BY'
        )
        self.assertEqual(p.titulo, 'Participación')

class ParticipacionComitesEvSerializerTest(TestCase):
    def test_serializer_participacion_valido(self):
        data = {
            'titulo': 'Participación',
            'pais': 'Ecuador',
            'anio': 2023,
            'institucion': 'Inst P',
            'tipoProductividad': 'Comité',
            'licencia': 'CC-BY'
        }
        serializer = ParticipacionComitesEvSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

class ProcesoTecnicaModelTest(TestCase):
    def setUp(self):
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(uid_firebase='pt_uid', nombre='PT', apellido='User', email='pt@example.com', contrasena='pass', rol=self.rol, estado=True)

    def test_crear_proceso_tecnica(self):
        p = ProcesoTecnica.objects.create(
            usuario=self.usuario,
            titulo='Proceso X',
            tipoProductividad='Técnica',
            pais='Ecuador',
            anio=2024,
            licencia='CC-BY'
        )
        self.assertEqual(p.titulo, 'Proceso X')

class ProcesoTecnicaSerializerTest(TestCase):
    def test_serializer_proceso_tecnica_valido(self):
        data = {
            'titulo': 'Proceso Y',
            'tipoProductividad': 'Técnica',
            'pais': 'Ecuador',
            'anio': 2023,
            'licencia': 'CC-BY'
        }
        serializer = ProcesoTecnicaSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

class RegistroFotograficoModelTest(TestCase):
    def setUp(self):
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(uid_firebase='rf_uid', nombre='RF', apellido='User', email='rf@example.com', contrasena='pass', rol=self.rol, estado=True)

    def test_crear_registro_fotografico(self):
        rf = RegistroFotografico.objects.create(
            usuario=self.usuario,
            titulo='Foto A',
            foto_r2='https://bucket.r2.dev/foto.jpg'
        )
        self.assertEqual(rf.titulo, 'Foto A')

class RegistroFotograficoSerializerTest(TestCase):
    def setUp(self):
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(uid_firebase='rf_s_uid', nombre='RF', apellido='Ser', email='rfs@example.com', contrasena='pass', rol=self.rol, estado=True)

    def test_serializer_registro_fotografico_valido(self):
        data = {
            'titulo': 'Foto B',
            'foto_r2': 'https://bucket.r2.dev/foto2.jpg'
        }
        serializer = RegistroFotograficoSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

 

class StaticPagesModelTest(TestCase):
    def test_mision(self):
        m = Mision.objects.create(contenido='Nuestra misión')
        self.assertEqual(str(m), 'Misión')

    def test_vision(self):
        v = Vision.objects.create(contenido='Nuestra visión')
        self.assertEqual(str(v), 'Visión')

    def test_historia(self):
        h = Historia.objects.create(contenido='Historia breve')
        self.assertEqual(str(h), 'Historia')

    def test_objetivo(self):
        o = Objetivo.objects.create(titulo='Objetivo 1', contenido='Contenido')
        self.assertEqual(str(o), 'Objetivo 1')

    def test_valor(self):
        val = Valor.objects.create(titulo='Respeto', contenido='Contenido')
        self.assertEqual(str(val), 'Respeto')


class NoticiaViewSetTest(APITestCase):
    """Pruebas para las vistas de Noticia"""

    def setUp(self):
        """Configuración inicial para cada test"""
        self.client = APIClient()
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(
            uid_firebase='test_uid_789',
            nombre='Admin',
            apellido='Test',
            email='admin@example.com',
            contrasena='password123',
            rol=self.rol,
            estado=True
        )
        
        # Mock del token de verificación
        self.mock_validar_rol = patch('apps.informacion.permissions.verificarToken.validarRol')
        self.mock_obtener_uid = patch('apps.informacion.permissions.verificarToken.obtenerUID')
        
        self.mock_validar = self.mock_validar_rol.start()
        self.mock_uid = self.mock_obtener_uid.start()
        
        self.mock_validar.return_value = True
        self.mock_uid.return_value = 'test_uid_789'

    def tearDown(self):
        """Limpiar los mocks después de cada test"""
        self.mock_validar_rol.stop()
        self.mock_obtener_uid.stop()

    def test_publicar_noticia_exitosa(self):
        """Test: Publicar una noticia exitosamente"""
        url = '/api/informacion/noticias/noticia/'
        data = {
            'titulo': 'Noticia de prueba',
            'contenido': 'Este es el contenido de prueba',
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Noticia.objects.count(), 1)
        self.assertEqual(Noticia.objects.get().titulo, 'Noticia de prueba')

    def test_publicar_noticia_con_imagen(self):
        """Test: Publicar noticia con path de imagen"""
        url = '/api/informacion/noticias/noticia/'
        data = {
            'titulo': 'Noticia con imagen',
            'contenido': 'Contenido',
            'image_path': 'images/test.jpg'
        }
        
        with patch('django.conf.settings.R2_BUCKET_PATH', 'https://bucket.r2.dev'):
            response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        noticia = Noticia.objects.get()
        self.assertIn('images/test.jpg', noticia.image_r2)

    def test_publicar_noticia_sin_autorizacion(self):
        """Test: Intentar publicar sin token válido"""
        self.mock_validar.return_value = False
        
        url = '/api/informacion/noticias/noticia/'
        data = {
            'titulo': 'Noticia de prueba',
            'contenido': 'Contenido',
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Noticia.objects.count(), 0)

    def test_publicar_noticia_datos_invalidos(self):
        """Test: Intentar publicar con datos inválidos"""
        url = '/api/informacion/noticias/noticia/'
        data = {
            'titulo': '',  # título vacío
            'contenido': 'Contenido',
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Noticia.objects.count(), 0)

    def test_editar_noticia_propia(self):
        """Test: Editar una noticia propia correctamente"""
        # Crear noticia primero
        noticia = Noticia.objects.create(
            titulo='Noticia original',
            contenido='Contenido original',
            usuario=self.usuario
        )
        
        url = f'/api/informacion/noticias/{noticia.pk}/noticia/'
        data = {
            'titulo': 'Noticia editada',
            'contenido': 'Contenido editado'
        }
        
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        noticia.refresh_from_db()
        self.assertEqual(noticia.titulo, 'Noticia editada')
        self.assertEqual(noticia.contenido, 'Contenido editado')

    def test_editar_noticia_de_otro_usuario(self):
        """Test: Intentar editar noticia de otro usuario (debe fallar)"""
        otro_usuario = Usuario.objects.create(
            uid_firebase='otro_uid',
            nombre='Otro',
            apellido='Usuario',
            email='otro@example.com',
            contrasena='password123',
            rol=self.rol
        )
        
        noticia = Noticia.objects.create(
            titulo='Noticia de otro',
            contenido='Contenido',
            usuario=otro_usuario
        )
        
        url = f'/api/informacion/noticias/{noticia.pk}/noticia/'
        data = {
            'titulo': 'Intento de edición',
            'contenido': 'No debería funcionar'
        }
        
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_editar_noticia_inexistente(self):
        """Test: Intentar editar una noticia que no existe"""
        url = '/api/informacion/noticias/9999/noticia/'
        data = {
            'titulo': 'No existe',
            'contenido': 'Esto fallará'
        }
        
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class IntegrationNoticiaTest(APITestCase):
    """Pruebas de integración para el flujo completo de Noticia"""

    def setUp(self):
        self.client = APIClient()
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(
            uid_firebase='integration_uid',
            nombre='Integration',
            apellido='Test',
            email='integration@example.com',
            contrasena='password123',
            rol=self.rol,
            estado=True
        )
        
        self.mock_validar_rol = patch('apps.informacion.permissions.verificarToken.validarRol')
        self.mock_obtener_uid = patch('apps.informacion.permissions.verificarToken.obtenerUID')
        
        self.mock_validar = self.mock_validar_rol.start()
        self.mock_uid = self.mock_obtener_uid.start()
        
        self.mock_validar.return_value = True
        self.mock_uid.return_value = 'integration_uid'

    def tearDown(self):
        self.mock_validar_rol.stop()
        self.mock_obtener_uid.stop()

    def test_flujo_completo_noticia(self):
        """Test: Flujo completo - crear, editar, verificar"""
        # 1. Crear noticia
        url_crear = '/api/informacion/noticias/noticia/'
        data_crear = {
            'titulo': 'Noticia completa',
            'contenido': 'Contenido inicial'
        }
        
        response = self.client.post(url_crear, data_crear, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        noticia_id = response.data['id']
        
        # 2. Verificar que se creó correctamente
        noticia = Noticia.objects.get(id=noticia_id)
        self.assertEqual(noticia.titulo, 'Noticia completa')
        self.assertEqual(noticia.usuario, self.usuario)
        
        # 3. Editar la noticia
        url_editar = f'/api/informacion/noticias/{noticia_id}/noticia/'
        data_editar = {
            'titulo': 'Noticia actualizada',
            'contenido': 'Contenido modificado'
        }
        
        response = self.client.put(url_editar, data_editar, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 4. Verificar la edición
        noticia.refresh_from_db()
        self.assertEqual(noticia.titulo, 'Noticia actualizada')
        self.assertEqual(noticia.contenido, 'Contenido modificado')


# =============================================================================
# TESTS ADICIONALES - ELIMINACIÓN, BÚSQUEDA, VALIDACIONES Y CASOS EDGE
# =============================================================================


class NoticiaEliminacionTest(APITestCase):
    """Pruebas para eliminación de noticias"""

    def setUp(self):
        self.client = APIClient()
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(
            uid_firebase='test_uid',
            nombre='Test',
            apellido='Usuario',
            email='test@example.com',
            contrasena='password123',
            rol=self.rol,
            estado=True
        )
        
        self.noticia = Noticia.objects.create(
            titulo='Noticia a eliminar',
            contenido='Contenido',
            usuario=self.usuario
        )
        
        self.mock_validar = patch('apps.informacion.permissions.verificarToken.validarRol')
        self.mock_uid = patch('apps.informacion.permissions.verificarToken.obtenerUID')
        
        self.mock_val = self.mock_validar.start()
        self.mock_u = self.mock_uid.start()
        
        self.mock_val.return_value = True
        self.mock_u.return_value = 'test_uid'

    def tearDown(self):
        self.mock_validar.stop()
        self.mock_uid.stop()

    def test_eliminar_noticia_propia(self):
        """Test: Eliminar una noticia propia"""
        url = f'/api/informacion/noticias/{self.noticia.pk}/Noticia/'
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Noticia.objects.filter(id=self.noticia.id).exists())

    def test_eliminar_noticia_otro_usuario(self):
        """Test: No se puede eliminar noticia de otro usuario"""
        otro_usuario = Usuario.objects.create(
            uid_firebase='otro_uid',
            nombre='Otro',
            apellido='Usuario',
            email='otro@example.com',
            contrasena='password123',
            rol=self.rol
        )
        
        noticia = Noticia.objects.create(
            titulo='Noticia de otro',
            contenido='Contenido',
            usuario=otro_usuario
        )
        
        url = f'/api/informacion/noticias/{noticia.pk}/Noticia/'
        response = self.client.delete(url)
        
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_eliminar_noticia_inexistente(self):
        """Test: Intentar eliminar noticia que no existe"""
        url = '/api/informacion/noticias/9999/Noticia/'
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class NoticiaConArchivoTest(APITestCase):
    """Pruebas para manejo de archivos en noticias"""

    def setUp(self):
        self.client = APIClient()
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(
            uid_firebase='test_uid',
            nombre='Test',
            apellido='Usuario',
            email='test@example.com',
            contrasena='password123',
            rol=self.rol,
            estado=True
        )
        
        self.mock_validar = patch('apps.informacion.permissions.verificarToken.validarRol')
        self.mock_uid = patch('apps.informacion.permissions.verificarToken.obtenerUID')
        
        self.mock_val = self.mock_validar.start()
        self.mock_u = self.mock_uid.start()
        
        self.mock_val.return_value = True
        self.mock_u.return_value = 'test_uid'

    def tearDown(self):
        self.mock_validar.stop()
        self.mock_uid.stop()

    def test_publicar_noticia_con_archivo(self):
        """Test: Publicar noticia con archivo adjunto"""
        url = '/api/informacion/noticias/noticia/'
        data = {
            'titulo': 'Noticia con archivo',
            'contenido': 'Contenido',
            'archivo_path': 'files/documento.pdf'
        }
        
        with patch('django.conf.settings.R2_BUCKET_FILES_PATH', 'https://bucket.r2.dev/files'):
            response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        noticia = Noticia.objects.get()
        self.assertIsNotNone(noticia.file_r2)
        self.assertIn('documento.pdf', noticia.file_r2)

    def test_publicar_noticia_con_imagen_y_archivo(self):
        """Test: Publicar noticia con imagen y archivo"""
        url = '/api/informacion/noticias/noticia/'
        data = {
            'titulo': 'Noticia completa',
            'contenido': 'Contenido con recursos',
            'image_path': 'images/foto.jpg',
            'archivo_path': 'files/documento.pdf'
        }
        
        with patch('django.conf.settings.R2_BUCKET_PATH', 'https://bucket.r2.dev'), \
             patch('django.conf.settings.R2_BUCKET_FILES_PATH', 'https://bucket.r2.dev/files'):
            response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        noticia = Noticia.objects.get()
        self.assertIsNotNone(noticia.image_r2)
        self.assertIsNotNone(noticia.file_r2)


class NoticiaBusquedaFiltroTest(APITestCase):
    """Pruebas para búsqueda y filtrado de noticias"""

    def setUp(self):
        self.client = APIClient()
        self.rol = Rol.objects.create(nombre='admin')
        
        self.usuario1 = Usuario.objects.create(
            uid_firebase='uid1',
            nombre='Juan',
            apellido='Pérez',
            email='juan@example.com',
            contrasena='password123',
            rol=self.rol
        )
        
        self.usuario2 = Usuario.objects.create(
            uid_firebase='uid2',
            nombre='María',
            apellido='García',
            email='maria@example.com',
            contrasena='password123',
            rol=self.rol
        )
        
        Noticia.objects.create(
            titulo='Noticia de tecnología',
            contenido='Contenido sobre tecnología',
            usuario=self.usuario1
        )
        
        Noticia.objects.create(
            titulo='Noticias del seminario',
            contenido='Contenido sobre el seminario',
            usuario=self.usuario2
        )
        
        Noticia.objects.create(
            titulo='Otra noticia',
            contenido='Contenido general',
            usuario=self.usuario1
        )

    def test_listar_todas_noticias(self):
        """Test: Listar todas las noticias"""
        url = '/api/informacion/noticias/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_filtrar_noticias_por_usuario(self):
        """Test: Filtrar noticias por usuario"""
        url = f'/api/informacion/noticias/?usuario={self.usuario1.id}'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_buscar_noticia_por_titulo(self):
        """Test: Buscar noticia por título"""
        url = '/api/informacion/noticias/?search=tecnología'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class NoticiaValidacionesTest(TestCase):
    """Pruebas para validaciones especiales de noticia"""

    def setUp(self):
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(
            uid_firebase='test_uid',
            nombre='Test',
            apellido='Usuario',
            email='test@example.com',
            contrasena='password123',
            rol=self.rol
        )

    def test_noticia_titulo_requerido(self):
        """Test: Validar que el título es requerido"""
        data = {
            'titulo': '',
            'contenido': 'Contenido',
            'usuario': self.usuario.id
        }
        
        serializer = NoticiaSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('titulo', serializer.errors)

    def test_noticia_contenido_requerido(self):
        """Test: Validar que el contenido es requerido"""
        data = {
            'titulo': 'Título',
            'contenido': '',
            'usuario': self.usuario.id
        }
        
        serializer = NoticiaSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('contenido', serializer.errors)

    def test_noticia_url_imagen_unica(self):
        """Test: URL de imagen debe ser única"""
        Noticia.objects.create(
            titulo='Noticia 1',
            contenido='Contenido 1',
            usuario=self.usuario,
            image_r2='https://bucket.r2.dev/imagen-unica.jpg'
        )
        
        with self.assertRaises(Exception):
            Noticia.objects.create(
                titulo='Noticia 2',
                contenido='Contenido 2',
                usuario=self.usuario,
                image_r2='https://bucket.r2.dev/imagen-unica.jpg'
            )

    def test_noticia_url_archivo_unica(self):
        """Test: URL de archivo debe ser única"""
        Noticia.objects.create(
            titulo='Noticia 1',
            contenido='Contenido 1',
            usuario=self.usuario,
            file_r2='https://bucket.r2.dev/documento-unico.pdf'
        )
        
        with self.assertRaises(Exception):
            Noticia.objects.create(
                titulo='Noticia 2',
                contenido='Contenido 2',
                usuario=self.usuario,
                file_r2='https://bucket.r2.dev/documento-unico.pdf'
            )


class NoticiaFechaTest(TestCase):
    """Pruebas para validaciones de fechas en noticias"""

    def setUp(self):
        self.rol = Rol.objects.create(nombre='admin')
        self.usuario = Usuario.objects.create(
            uid_firebase='test_uid',
            nombre='Test',
            apellido='Usuario',
            email='test@example.com',
            contrasena='password123',
            rol=self.rol
        )

    def test_fecha_publicacion_automatica(self):
        """Test: La fecha de publicación se establece automáticamente"""
        from django.utils import timezone
        hoy = timezone.now().date()
        
        noticia = Noticia.objects.create(
            titulo='Noticia',
            contenido='Contenido',
            usuario=self.usuario
        )
        
        self.assertEqual(noticia.fecha_publicacion, hoy)

    def test_noticias_ordenadas_por_fecha(self):
        """Test: Verificar que las noticias mantienen orden por fecha"""
        noticia1 = Noticia.objects.create(
            titulo='Primera',
            contenido='Contenido 1',
            usuario=self.usuario
        )
        
        noticia2 = Noticia.objects.create(
            titulo='Segunda',
            contenido='Contenido 2',
            usuario=self.usuario
        )
        
        self.assertGreaterEqual(noticia2.fecha_publicacion, noticia1.fecha_publicacion)


class NoticiaMultiplesUsuariosTest(APITestCase):
    """Pruebas para noticias de múltiples usuarios"""

    def setUp(self):
        self.client = APIClient()
        self.rol = Rol.objects.create(nombre='admin')
        
        self.usuario1 = Usuario.objects.create(
            uid_firebase='uid1',
            nombre='Usuario',
            apellido='Uno',
            email='user1@example.com',
            contrasena='password123',
            rol=self.rol
        )
        
        self.usuario2 = Usuario.objects.create(
            uid_firebase='uid2',
            nombre='Usuario',
            apellido='Dos',
            email='user2@example.com',
            contrasena='password123',
            rol=self.rol
        )

    @patch('apps.informacion.permissions.verificarToken.validarRol')
    @patch('apps.informacion.permissions.verificarToken.obtenerUID')
    def test_usuario_no_puede_editar_noticia_otro_usuario(self, mock_uid, mock_validar):
        """Test: Un usuario no puede editar noticias de otro usuario"""
        mock_validar.return_value = True
        mock_uid.return_value = 'uid1'
        
        noticia = Noticia.objects.create(
            titulo='Noticia del usuario 1',
            contenido='Contenido',
            usuario=self.usuario1
        )
        
        mock_uid.return_value = 'uid2'
        
        url = f'/api/informacion/noticias/{noticia.pk}/noticia/'
        data = {
            'titulo': 'Título modificado',
            'contenido': 'Contenido modificado'
        }
        
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
