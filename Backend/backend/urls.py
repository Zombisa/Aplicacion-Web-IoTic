from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/usuarios/', include('apps.usuarios_roles.urls')),
    path('api/inventario/', include('apps.inventario.urls')),
]
