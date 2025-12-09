from rest_framework.response import Response
from firebase_admin import auth
from rest_framework import status

class verificarToken():
    def validarRol(request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({'error': 'Token no proporcionado'}, status=status.HTTP_401_UNAUTHORIZED)
        token = auth_header.split(' ')[1]
        
        try:
            # Verificar token y obtener datos del usuario actual
            decoded_token = auth.verify_id_token(token)
            role = decoded_token.get('role')
            
            if role not in ['admin', 'mentor']:
                return Response(
                    {'error': 'No tienes permisos para realizar esta acción'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            return True
        except auth.InvalidIdTokenError:
            return None
        except auth.ExpiredIdTokenError:
            return None
    
    def obtenerUID(request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        token = auth_header.split(' ')[1]
        
        try:
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token.get('user_id')
            return uid
        except Exception as e:
            return None