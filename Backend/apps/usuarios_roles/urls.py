from rest_framework.routers import DefaultRouter
from .views import RolViewSet, crear_usuario_admin
from django.urls import path, include

router = DefaultRouter()
#router.register(r'crear_usuario_admin', crear_usuario_admin)
router.register(r'roles', RolViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('crear_usuario_admin/', crear_usuario_admin, name='crear_usuario_admin'),
]