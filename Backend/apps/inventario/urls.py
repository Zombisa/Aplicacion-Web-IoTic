from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventarioViewSet, PrestamoViewSet
from .GenerarUrlR2 import GenerarURLR2ViewSet

router = DefaultRouter()
router.register(r'items', InventarioViewSet, basename='inventario')
router.register(r'prestamos', PrestamoViewSet, basename='prestamo')
router.register(r'urlfirmada', GenerarURLR2ViewSet, basename='urlfirmada')

urlpatterns = [
    path('', include(router.urls)),
    
]
