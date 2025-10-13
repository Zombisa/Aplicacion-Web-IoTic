import requests
import jwt
from jwt.algorithms import RSAAlgorithm
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import AuthenticationLog

GOOGLE_CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
FIREBASE_PROJECT_ID = "iotic-844db"

@api_view(['GET'])
def auth_me(request):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return Response({'detail': 'Missing Bearer token'}, status=status.HTTP_401_UNAUTHORIZED)

    id_token = auth_header.split(' ', 1)[1]

    try:
        #Obtener las claves públicas de Google
        res = requests.get(GOOGLE_CERTS_URL)
        certs = res.json()

        #Decodificar el encabezado del token para saber cuál clave usar
        unverified_header = jwt.get_unverified_header(id_token)
        key_id = unverified_header['kid']
        public_key = RSAAlgorithm.from_jwk(jwt.PyJWKClient(GOOGLE_CERTS_URL).get_signing_key_from_jwt(id_token).key)

        #Verificar el token
        decoded = jwt.decode(
            id_token,
            key=public_key,
            algorithms=['RS256'],
            audience=FIREBASE_PROJECT_ID,
            issuer=f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}"
        )

        return Response({'uid': decoded.get('user_id'), 'claims': decoded}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'detail': 'Invalid token', 'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

def log_authentication_attempt(email, ip_address, user_agent, success, error_type=None, error_message=None, session_id=None):
    """Función para registrar intentos de autenticación"""
    try:
        # Verificar si hay demasiados intentos fallidos desde la misma IP
        recent_failed_attempts = AuthenticationLog.objects.filter(
            ip_address=ip_address,
            success=False,
            timestamp__gte=timezone.now() - timezone.timedelta(minutes=15)
        ).count()
        
        # Si hay más de 10 intentos fallidos en 15 minutos, marcar como too_many_attempts
        if recent_failed_attempts >= 10 and not success:
            error_type = 'too_many_attempts'
            error_message = 'Demasiados intentos fallidos desde esta IP'
        
        AuthenticationLog.objects.create(
            email=email,
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            error_type=error_type or 'other',
            error_message=error_message or '',
            session_id=session_id
        )
        
        # Log adicional para debugging
        print(f"Auth attempt logged: {email} - {ip_address} - Success: {success} - Error: {error_type}")
        
    except Exception as e:
        print(f"Error al registrar log de autenticación: {e}")
        # Intentar registrar al menos un log básico
        try:
            AuthenticationLog.objects.create(
                email=email or 'unknown',
                ip_address=ip_address or '127.0.0.1',
                user_agent=user_agent or 'unknown',
                success=success,
                error_type='server_error',
                error_message=f'Error logging: {str(e)}'
            )
        except:
            pass

@api_view(['POST'])
def log_authentication_attempt(request):
    """Endpoint para registrar intentos de autenticación (exitosos y fallidos) desde el frontend"""
    try:
        data = request.data
        email = data.get('email', '').strip().lower()
        success = data.get('success', False)
        error_type = data.get('error_type', 'other')
        error_message = data.get('error_message', '')
        session_id = data.get('session_id', '')
        
        # Validar email básico
        if not email or '@' not in email:
            return Response({'error': 'Email inválido'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Obtener IP del cliente con mejor detección
        ip_address = get_client_ip(request)
        
        # Obtener User Agent
        user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]  # Limitar longitud
        
        # Verificar si la IP está bloqueada por demasiados intentos
        recent_failed_attempts = AuthenticationLog.objects.filter(
            ip_address=ip_address,
            success=False,
            timestamp__gte=timezone.now() - timezone.timedelta(minutes=15)
        ).count()
        
        if recent_failed_attempts >= 10:
            return Response({
                'error': 'IP bloqueada temporalmente por demasiados intentos fallidos',
                'blocked': True,
                'retry_after': 900  # 15 minutos en segundos
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Registrar el intento
        log_authentication_attempt(
            email=email,
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            error_type=error_type if not success else None,
            error_message=error_message if not success else None,
            session_id=session_id
        )
        
        return Response({
            'status': 'logged',
            'ip_address': ip_address,
            'recent_attempts': recent_failed_attempts + (0 if success else 1)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error en log_authentication_attempt endpoint: {e}")
        return Response({'error': 'Error interno del servidor'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_client_ip(request):
    """Obtiene la IP real del cliente considerando proxies y load balancers"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
    
    # Validar que sea una IP válida
    import re
    ip_pattern = r'^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
    if re.match(ip_pattern, ip):
        return ip
    return '127.0.0.1'

@api_view(['GET'])
def get_authentication_logs(request):
    """Endpoint para obtener logs de autenticación (solo para administradores)"""
    try:
        # Parámetros de consulta
        limit = int(request.GET.get('limit', 100))
        offset = int(request.GET.get('offset', 0))
        success_filter = request.GET.get('success')
        error_type_filter = request.GET.get('error_type')
        email_filter = request.GET.get('email', '').strip()
        ip_filter = request.GET.get('ip', '').strip()
        days = int(request.GET.get('days', 7))  # Últimos 7 días por defecto
        
        # Construir consulta
        query = AuthenticationLog.objects.all()
        
        # Filtrar por fecha
        if days > 0:
            start_date = timezone.now() - timezone.timedelta(days=days)
            query = query.filter(timestamp__gte=start_date)
        
        # Aplicar filtros
        if success_filter is not None:
            query = query.filter(success=success_filter.lower() == 'true')
        
        if error_type_filter:
            query = query.filter(error_type=error_type_filter)
        
        if email_filter:
            query = query.filter(email__icontains=email_filter)
        
        if ip_filter:
            query = query.filter(ip_address__icontains=ip_filter)
        
        # Ordenar y paginar
        total_count = query.count()
        logs = query.order_by('-timestamp')[offset:offset + limit]
        
        logs_data = []
        for log in logs:
            logs_data.append({
                'id': log.id,
                'email': log.email,
                'ip_address': log.ip_address,
                'success': log.success,
                'error_type': log.error_type,
                'error_type_display': log.error_type_display,
                'error_message': log.error_message,
                'timestamp': log.timestamp.isoformat(),
                'user_agent': log.user_agent,
                'session_id': log.session_id
            })
        
        # Estadísticas adicionales
        stats = {
            'total_attempts': total_count,
            'successful_attempts': query.filter(success=True).count(),
            'failed_attempts': query.filter(success=False).count(),
            'unique_ips': query.values('ip_address').distinct().count(),
            'unique_emails': query.values('email').distinct().count()
        }
        
        return Response({
            'logs': logs_data,
            'pagination': {
                'total': total_count,
                'limit': limit,
                'offset': offset,
                'has_more': offset + limit < total_count
            },
            'stats': stats
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error en get_authentication_logs: {e}")
        return Response({'error': 'Error interno del servidor'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_security_stats(request):
    """Endpoint para obtener estadísticas de seguridad (solo para administradores)"""
    try:
        from datetime import timedelta
        from django.db import models
        
        # Estadísticas de las últimas 24 horas
        last_24h = timezone.now() - timedelta(hours=24)
        last_7d = timezone.now() - timedelta(days=7)
        
        # Intentos totales
        total_attempts_24h = AuthenticationLog.objects.filter(timestamp__gte=last_24h).count()
        total_attempts_7d = AuthenticationLog.objects.filter(timestamp__gte=last_7d).count()
        
        # Intentos exitosos
        successful_attempts_24h = AuthenticationLog.objects.filter(
            timestamp__gte=last_24h, success=True
        ).count()
        
        # Intentos fallidos
        failed_attempts_24h = AuthenticationLog.objects.filter(
            timestamp__gte=last_24h, success=False
        ).count()
        
        # IPs más activas (intentos fallidos)
        top_failed_ips = AuthenticationLog.objects.filter(
            timestamp__gte=last_24h, success=False
        ).values('ip_address').annotate(
            count=models.Count('id')
        ).order_by('-count')[:10]
        
        # Emails más atacados
        top_attacked_emails = AuthenticationLog.objects.filter(
            timestamp__gte=last_24h, success=False
        ).values('email').annotate(
            count=models.Count('id')
        ).order_by('-count')[:10]
        
        # Tipos de error más comunes
        error_types = AuthenticationLog.objects.filter(
            timestamp__gte=last_24h, success=False
        ).values('error_type').annotate(
            count=models.Count('id')
        ).order_by('-count')
        
        # Intentos sospechosos (más de 5 intentos fallidos desde la misma IP)
        suspicious_ips = []
        for ip_data in top_failed_ips:
            if ip_data['count'] >= 5:
                suspicious_ips.append({
                    'ip_address': ip_data['ip_address'],
                    'failed_attempts': ip_data['count']
                })
        
        stats = {
            'timeframe': '24 horas',
            'total_attempts': {
                'last_24h': total_attempts_24h,
                'last_7d': total_attempts_7d
            },
            'success_rate': {
                'successful_24h': successful_attempts_24h,
                'failed_24h': failed_attempts_24h,
                'success_rate_24h': round(
                    (successful_attempts_24h / total_attempts_24h * 100) if total_attempts_24h > 0 else 0, 2
                )
            },
            'top_failed_ips': list(top_failed_ips),
            'top_attacked_emails': list(top_attacked_emails),
            'error_types': list(error_types),
            'suspicious_ips': suspicious_ips,
            'security_alerts': len(suspicious_ips)
        }
        
        return Response(stats, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error en get_security_stats: {e}")
        return Response({'error': 'Error interno del servidor'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
