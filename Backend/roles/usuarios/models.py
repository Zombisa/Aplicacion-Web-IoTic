from django.db import models
from django.utils import timezone

class AuthenticationLog(models.Model):
    """Modelo para registrar intentos de autenticación"""
    
    ERROR_TYPES = [
        ('user_not_found', 'Usuario no existe'),
        ('wrong_password', 'Contraseña incorrecta'),
        ('invalid_email', 'Email inválido'),
        ('invalid_credential', 'Credenciales incorrectas'),
        ('account_disabled', 'Cuenta deshabilitada'),
        ('too_many_attempts', 'Demasiados intentos'),
        ('ip_blocked', 'IP bloqueada'),
        ('network_error', 'Error de red'),
        ('server_error', 'Error del servidor'),
        ('invalid_token', 'Token inválido'),
        ('expired_token', 'Token expirado'),
        ('missing_credentials', 'Credenciales faltantes'),
        ('weak_password', 'Contraseña muy débil'),
        ('email_not_verified', 'Email no verificado'),
        ('account_locked', 'Cuenta bloqueada'),
        ('inactivity_logout', 'Logout por inactividad'),
        ('other', 'Otro error')
    ]
    
    email = models.EmailField(max_length=255, help_text="Email utilizado en el intento de login")
    ip_address = models.GenericIPAddressField(help_text="Dirección IP del usuario")
    user_agent = models.TextField(blank=True, null=True, help_text="User Agent del navegador")
    error_type = models.CharField(max_length=20, choices=ERROR_TYPES, blank=True, null=True, help_text="Tipo de error de autenticación")
    error_message = models.TextField(blank=True, null=True, help_text="Mensaje de error detallado")
    timestamp = models.DateTimeField(default=timezone.now, help_text="Fecha y hora del intento")
    success = models.BooleanField(default=False, help_text="Indica si el intento fue exitoso")
    session_id = models.CharField(max_length=100, blank=True, null=True, help_text="ID de sesión del usuario")
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Log de Autenticación'
        verbose_name_plural = 'Logs de Autenticación'
        indexes = [
            models.Index(fields=['email', 'timestamp']),
            models.Index(fields=['ip_address', 'timestamp']),
            models.Index(fields=['success', 'timestamp']),
        ]
    
    def __str__(self):
        status = "Exitoso" if self.success else "Fallido"
        return f"{self.email} - {status} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
    
    @property
    def error_type_display(self):
        """Retorna el nombre legible del tipo de error"""
        if self.error_type:
            return dict(self.ERROR_TYPES).get(self.error_type, self.error_type)
        return 'N/A'
    
    @property
    def is_suspicious(self):
        """Determina si el intento es sospechoso basado en varios factores"""
        if self.success:
            return False
        
        # Verificar si hay muchos intentos fallidos desde la misma IP en las últimas 24 horas
        from django.utils import timezone
        from datetime import timedelta
        
        recent_attempts = AuthenticationLog.objects.filter(
            ip_address=self.ip_address,
            success=False,
            timestamp__gte=timezone.now() - timedelta(hours=24)
        ).count()
        
        return recent_attempts >= 5
    
    @property
    def risk_level(self):
        """Nivel de riesgo del intento (bajo, medio, alto)"""
        if self.success:
            return 'bajo'
        
        if self.is_suspicious:
            return 'alto'
        
        if self.error_type in ['too_many_attempts', 'ip_blocked', 'account_locked']:
            return 'alto'
        
        if self.error_type in ['wrong_password', 'user_not_found']:
            return 'medio'
        
        return 'bajo'
    
    @classmethod
    def get_failed_attempts_count(cls, ip_address, hours=1):
        """Obtiene el número de intentos fallidos desde una IP en las últimas N horas"""
        from django.utils import timezone
        from datetime import timedelta
        
        return cls.objects.filter(
            ip_address=ip_address,
            success=False,
            timestamp__gte=timezone.now() - timedelta(hours=hours)
        ).count()
    
    @classmethod
    def get_user_failed_attempts_count(cls, email, hours=1):
        """Obtiene el número de intentos fallidos para un email en las últimas N horas"""
        from django.utils import timezone
        from datetime import timedelta
        
        return cls.objects.filter(
            email=email,
            success=False,
            timestamp__gte=timezone.now() - timedelta(hours=hours)
        ).count()
