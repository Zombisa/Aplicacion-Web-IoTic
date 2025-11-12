from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventarioViewSet, PrestamoViewSet

router = DefaultRouter()
router.register(r'items', InventarioViewSet, basename='inventario')
router.register(r'prestamos', PrestamoViewSet, basename='prestamo')

urlpatterns = [
    path('', include(router.urls)),
]
