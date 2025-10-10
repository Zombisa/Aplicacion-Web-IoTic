from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .models import Usuario, Rol
from .serializers import UsuarioSerializer, RolSerializer

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from firebase_admin import auth
from .decorators import verificar_token
import json
from rest_framework.decorators import api_view


class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer


@api_view(['POST'])
def asignar_rol(request):
    """
    Endpoint protegido: solo los administradores pueden asignar roles.
    Espera un token válido en el header y un JSON con { "uid": "...", "rol": "..." }.
    """
    # Obtener el token del encabezado Authorization
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'error': 'Token no proporcionado'}, status=status.HTTP_401_UNAUTHORIZED)

    token = auth_header.split(' ')[1]

    try:
        # Verificar token y obtener datos del usuario actual
        decoded_token = auth.verify_id_token(token)
        role = decoded_token.get('role')

        # Solo los administradores pueden asignar roles
        if role != 'admin':
            return Response({'error': 'No autorizado. Solo los administradores pueden asignar roles.'},
                            status=status.HTTP_403_FORBIDDEN)

        # Obtener los datos enviados en el body
        uid_destino = request.data.get('uid')
        nuevo_rol = request.data.get('role')

        if not uid_destino or not nuevo_rol:
            return Response({'error': 'Se requieren los campos uid y rol.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Asignar el nuevo rol en Firebase
        auth.set_custom_user_claims(uid_destino, {'role': nuevo_rol})
        return Response({'message': f'Rol "{nuevo_rol}" asignado correctamente al usuario {uid_destino}.'})
    except Exception as e:
        return Response({'error': f'Error al asignar rol: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
