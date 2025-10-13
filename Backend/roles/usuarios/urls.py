from django.urls import path
from .views import auth_me, log_authentication_attempt, get_authentication_logs, get_security_stats

urlpatterns = [
    path('auth/me', auth_me),
    path('auth/log-attempt', log_authentication_attempt),
    path('auth/logs', get_authentication_logs),
    path('auth/security-stats', get_security_stats),
]

