from django.contrib import admin
from django.utils.html import format_html
from .models import AuthenticationLog

@admin.register(AuthenticationLog)
class AuthenticationLogAdmin(admin.ModelAdmin):
    list_display = ['email', 'ip_address', 'error_type_display', 'success_status', 'timestamp', 'user_agent_short']
    list_filter = ['success', 'error_type', 'timestamp']
    search_fields = ['email', 'ip_address', 'error_message']
    readonly_fields = ['timestamp', 'ip_address', 'user_agent', 'session_id']
    ordering = ['-timestamp']
    list_per_page = 50
    
    fieldsets = (
        ('Información del Usuario', {
            'fields': ('email', 'ip_address', 'session_id')
        }),
        ('Resultado de Autenticación', {
            'fields': ('success', 'error_type', 'error_message')
        }),
        ('Información Técnica', {
            'fields': ('user_agent', 'timestamp'),
            'classes': ('collapse',)
        }),
    )
    
    def success_status(self, obj):
        if obj.success:
            return format_html('<span style="color: green; font-weight: bold;">✓ Exitoso</span>')
        else:
            return format_html('<span style="color: red; font-weight: bold;">✗ Fallido</span>')
    success_status.short_description = 'Estado'
    
    def user_agent_short(self, obj):
        if obj.user_agent:
            return obj.user_agent[:50] + '...' if len(obj.user_agent) > 50 else obj.user_agent
        return 'N/A'
    user_agent_short.short_description = 'User Agent'
    
    def has_add_permission(self, request):
        return False  # No permitir agregar logs manualmente
    
    def has_change_permission(self, request, obj=None):
        return False  # No permitir editar logs
