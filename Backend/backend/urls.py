from django.contrib import admin
from django.urls import path, include
from apps.usuarios_roles.views import asignar_rol

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.usuarios_roles.urls')),
    path('asignar-rol/', asignar_rol),
]
