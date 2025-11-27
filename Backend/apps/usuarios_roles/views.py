from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from firebase_admin import auth
from django.shortcuts import get_object_or_404

from .models import Usuario, Rol
from .serializers import UsuarioSerializer, RolSerializer
from .services import asignar_rol_firebase
from .decorators import verificar_roles, verificar_token

# ======================================================
# LISTAR USUARIOS
# ======================================================
@api_view(["GET"])
def listar_usuarios(request):
    usuarios = Usuario.objects.all()
    serializer = UsuarioSerializer(usuarios, many=True)
    return Response(serializer.data)


# ======================================================
# CREAR USUARIO (Firebase + PostgreSQL)
# ======================================================
@api_view(["POST"])
def crear_usuario(request):
    data = request.data

    required_fields = ["email", "contrasena", "nombre", "apellido", "rol"]
    for field in required_fields:
        if field not in data:
            return Response({"error": f"'{field}' es requerido"}, status=400)

    # Validar rol
    rol = get_object_or_404(Rol, nombre=data["rol"])

    # Crear usuario en Firebase
    try:
        user_record = auth.create_user(
            email=data["email"],
            password=data["contrasena"]
        )
    except Exception as e:
        return Response({"error": f"Error en Firebase: {str(e)}"}, status=400)

    # Guardar en PostgreSQL
    usuario = Usuario.objects.create(
        uid_firebase=user_record.uid,
        nombre=data["nombre"],
        apellido=data["apellido"],
        email=data["email"],
        contrasena="",
        rol=rol,
        estado=True
    )

    # Asignar custom claim
    asignar_rol_firebase(user_record.uid, rol.nombre)

    return Response(UsuarioSerializer(usuario).data, status=201)


# ======================================================
# LISTAR ROLES
# ======================================================
@api_view(["GET"])
def listar_roles(request):
    roles = Rol.objects.all()
    serializer = RolSerializer(roles, many=True)
    return Response(serializer.data)


# ======================================================
# ASIGNAR ROL A UN USUARIO EXISTENTE
# ======================================================
@api_view(["POST"])
@verificar_token
@verificar_roles(["admin"])
def asignar_rol(request):
    uid = request.data.get("uid")
    rol_name = request.data.get("rol")

    if not uid or not rol_name:
        return Response({"error": "uid y rol son requeridos"}, status=400)

    # Buscar usuario
    try:
        usuario = Usuario.objects.get(uid_firebase=uid)
    except Usuario.DoesNotExist:
        return Response({"error": "Usuario no existe en la base de datos"}, status=404)

    # Buscar rol
    try:
        rol = Rol.objects.get(nombre=rol_name)
    except Rol.DoesNotExist:
        return Response({"error": "El rol no existe"}, status=404)

    # Actualizar en base de datos
    usuario.rol = rol
    usuario.save()

    # Actualizar en Firebase
    asignar_rol_firebase(uid, rol.nombre)

    return Response({"message": f"Rol '{rol.nombre}' asignado a {uid}"})



@api_view(["POST"])
@verificar_token
@verificar_roles(["admin"])
def sincronizar_firebase(request):
    exec(open("apps/usuarios_roles/scripts/sincronizar_firebase.py").read())
    return Response({"message": "Sincronización completa"})


# Actualizar usuario
@api_view(["PUT", "PATCH"])
@verificar_token
@verificar_roles(["admin"])
def actualizar_usuario(request, usuario_id):
    try:
        usuario = Usuario.objects.get(id=usuario_id)
    except Usuario.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=404)
    
    data = request.data
    
    # Actualizar campos si están presentes
    if "nombre" in data:
        usuario.nombre = data["nombre"]
    if "apellido" in data:
        usuario.apellido = data["apellido"]
    if "email" in data:
        usuario.email = data["email"]
    if "rol" in data:
        try:
            rol = Rol.objects.get(nombre=data["rol"])
            usuario.rol = rol
            # Actualizar custom claim en Firebase
            if usuario.uid_firebase:
                asignar_rol_firebase(usuario.uid_firebase, rol.nombre)
        except Rol.DoesNotExist:
            return Response({"error": "El rol no existe"}, status=400)
    
    usuario.save()
    serializer = UsuarioSerializer(usuario)
    return Response(serializer.data)

#activar o desactivar usuario
@api_view(["PATCH"])
@verificar_token
@verificar_roles(["admin"])
def cambiar_estado_usuario(request, usuario_id):
    try:
        usuario = Usuario.objects.get(id=usuario_id)
    except Usuario.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=404)
    
    # Cambiar estado
    usuario.estado = not usuario.estado
    usuario.save()
    
    # Si se desactiva, también desactivar en Firebase
    if usuario.uid_firebase and not usuario.estado:
        try:
            auth.update_user(usuario.uid_firebase, disabled=True)
        except Exception as e:
            print(f"Error al desactivar usuario en Firebase: {e}")
    elif usuario.uid_firebase and usuario.estado:
        try:
            auth.update_user(usuario.uid_firebase, disabled=False)
        except Exception as e:
            print(f"Error al activar usuario en Firebase: {e}")
    
    serializer = UsuarioSerializer(usuario)
    return Response(serializer.data)


#eliminar usuario
@api_view(["DELETE"])
@verificar_token
@verificar_roles(["admin"])
def eliminar_usuario(request, usuario_id):
    try:
        usuario = Usuario.objects.get(id=usuario_id)
    except Usuario.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=404)
    
    uid_firebase = usuario.uid_firebase
    
    # Eliminar de PostgreSQL
    usuario.delete()
    
    # Eliminar de Firebase si existe
    if uid_firebase:
        try:
            auth.delete_user(uid_firebase)
        except Exception as e:
            print(f"Error al eliminar usuario de Firebase: {e}")
    
    return Response({"message": "Usuario eliminado correctamente"}, status=200)