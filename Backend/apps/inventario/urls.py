from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PrestamoViewSet, InventarioViewSet

router = DefaultRouter()
router.register(r'inventario', InventarioViewSet, basename='inventario')
router.register(r'prestamos', PrestamoViewSet, basename='prestamos')

urlpatterns = [
    path('', include(router.urls)),
]
