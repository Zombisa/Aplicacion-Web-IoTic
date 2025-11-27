from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    listar_usuarios, crear_usuario, listar_roles, asignar_rol, sincronizar_firebase,
    actualizar_usuario, cambiar_estado_usuario, eliminar_usuario
)

router = DefaultRouter()

urlpatterns = [
    path('', listar_usuarios, name='listar_usuarios'),
    path('crear/', crear_usuario, name='crear_usuario'),
    path('roles/', listar_roles, name='listar_roles'),
    path('asignar-rol/', asignar_rol, name='asignar_rol'),
    path('sincronizar/', sincronizar_firebase, name='sincronizar'),
    path('<int:usuario_id>/', actualizar_usuario, name='actualizar_usuario'),
    path('<int:usuario_id>/estado/', cambiar_estado_usuario, name='cambiar_estado_usuario'),
    path('<int:usuario_id>/eliminar/', eliminar_usuario, name='eliminar_usuario'),
]
