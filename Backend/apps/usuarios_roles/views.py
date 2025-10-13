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
from .services import crear_usuario

class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer

"""
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
"""

@api_view(['POST'])
def crear_usuario_admin(request):
    """
    Endpoint protegido: solo los administradores pueden crear usuarios.
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
            return Response({'error': 'No autorizado. Solo los administradores pueden crear usuarios.'},
                            status=status.HTTP_403_FORBIDDEN)

        # Obtener los datos enviados en el body
        uid_destino = request.data.get('uid')
        nombre = request.data.get('nombre')
        apellido = request.data.get('apellido')
        email = request.data.get('email')
        contrasena = request.data.get('contrasena')
        nuevo_rol = request.data.get('role')


        if not all([nombre, apellido, email, contrasena, nuevo_rol]):
            return Response({'error': 'Todos los campos son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

        # obtener rol
        try:
            rol_obj = Rol.objects.get(nombre=nuevo_rol)
        except Rol.DoesNotExist:
            return Response({'error': f'El rol "{nuevo_rol}" no existe en la base de datos.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Llamando a la funcion de services.py
        usuario = crear_usuario({
            'nombre': nombre,
            'apellido': apellido,
            'email': email,
            'contrasena': contrasena,
            'rol': rol_obj
        })

        #Responder al cliente
        return Response({
            'message': 'Usuario creado correctamente.',
            'usuario': {
                'id': usuario.id,
                'nombre': usuario.nombre,
                'apellido': usuario.apellido,
                'email': usuario.email,
                'rol': usuario.rol.nombre
            }
        }, status=status.HTTP_201_CREATED)

    except auth.EmailAlreadyExistsError:
        return Response({'error': 'El correo ya está registrado en Firebase.'}, status=status.HTTP_400_BAD_REQUEST)
    except auth.InvalidIdTokenError:
        return Response({'error': 'Token inválido.'}, status=status.HTTP_401_UNAUTHORIZED)
    except auth.ExpiredIdTokenError:
        return Response({'error': 'Token expirado.'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'error': f'Error al crear usuario: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': f'Error al asignar rol: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
