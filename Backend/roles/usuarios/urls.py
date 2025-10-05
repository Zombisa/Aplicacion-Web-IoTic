from django.urls import path
from .views import auth_me

urlpatterns = [
    path('auth/me', auth_me),
]

