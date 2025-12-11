from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.informacion.Views.NoticiaView import NoticiaViewSet
from apps.informacion.Views.EventoView import EventoViewSet
from apps.informacion.Views.CursoView import CursoViewSet
from apps.informacion.Views.LibroView import LibroViewSet
from apps.informacion.Views.CapLibroView import CapLibroViewSet
from apps.informacion.Views.TrabajoEventosView import TrabajoEventosViewSet
from apps.informacion.Views.RevistaView import RevistaViewSet
from apps.informacion.Views.SoftwareView import SoftwareViewSet
from apps.informacion.Views.ParticipacionComitesEvView import ParticipacionComitesEvViewSet
from apps.informacion.Views.MaterialDidacticoView import MaterialDidacticoViewSet
from apps.informacion.Views.JuradoView import JuradoViewSet
from apps.informacion.Views.ProcesoTecnicaView import ProcesoTecnicaViewSet
from apps.informacion.Views.TutoriaConcluidaView import TutoriaConcluidaViewSet
from apps.informacion.Views.TutoriaEnMarchaView import TutoriaEnMarchaViewSet
from apps.informacion.Views.GenerarUrlR2 import GenerarURLR2ViewSet
from apps.informacion.Views.PublicacionesView import PublicacionesViewSet
from apps.informacion.Views.RegistroFotograficoView import RegistroFotograficoViewSet
from apps.informacion.Views.ProductividadView import (
    MisionViewSet, VisionViewSet, HistoriaViewSet,
    ObjetivoViewSet, ValorViewSet
)

router = DefaultRouter()
router.register(r'noticias', NoticiaViewSet, basename='noticia')
router.register(r'eventos', EventoViewSet, basename='evento')
router.register(r'cursos', CursoViewSet, basename='curso')
router.register(r'libros', LibroViewSet, basename='libro')
router.register(r'capLibros', CapLibroViewSet, basename='capLibro')
router.register(r'trabajoEventos', TrabajoEventosViewSet, basename='trabajoEvento')
router.register(r'revistas', RevistaViewSet, basename='revista')
router.register(r'software', SoftwareViewSet, basename='software')
router.register(r'participacionComitesEv', ParticipacionComitesEvViewSet, basename='participacionComitesEv')
router.register(r'materialDidactico', MaterialDidacticoViewSet, basename='materialDidactico')
router.register(r'jurados', JuradoViewSet, basename='jurado')
router.register(r'procesosTecnicas', ProcesoTecnicaViewSet, basename='procesoTecnica')
router.register(r'tutoriasConcluidas', TutoriaConcluidaViewSet, basename='tutoriaConcluida')
router.register(r'tutoriasEnMarcha', TutoriaEnMarchaViewSet, basename='tutoriaEnMarcha')
router.register(r'urlfirmada', GenerarURLR2ViewSet, basename='urlfirmada')
router.register(r'registrosFotograficos', RegistroFotograficoViewSet, basename='registroFotografico')
router.register(r'mision', MisionViewSet, basename='mision')
router.register(r'vision', VisionViewSet, basename='vision')
router.register(r'historia', HistoriaViewSet, basename='historia')
router.register(r'objetivos', ObjetivoViewSet, basename='objetivos')
router.register(r'valores', ValorViewSet, basename='valores')
router.register(r'publicaciones', PublicacionesViewSet, basename='publicaciones')

urlpatterns = [
    path('', include(router.urls)),
]