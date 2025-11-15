from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.informacion.Views.NoticiaView import NoticiaViewSet
from apps.informacion.Views.EventoView import EventoViewSet
from apps.informacion.Views.CursoView import CursoViewSet

router = DefaultRouter()
router.register(r'noticias', NoticiaViewSet, basename='noticia')
router.register(r'eventos', EventoViewSet, basename='evento')
router.register(r'cursos', CursoViewSet, basename='curso')

urlpatterns = [
    path('', include(router.urls)),
]