from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, RolViewSet, asignar_rol
from django.urls import path

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'roles', RolViewSet)

urlpatterns = router.urls
