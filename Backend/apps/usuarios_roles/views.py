from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from firebase_admin import auth
from django.shortcuts import get_object_or_404

from .models import Usuario, Rol
from .serializers import UsuarioSerializer, RolSerializer
from .services import asignar_rol_firebase
from .decorators import verificar_roles


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
    asignar_rol_firebase(uid, rol.nombre)   # ← CORRECTO

    return Response({"message": f"Rol '{rol.nombre}' asignado a {uid}"})



@api_view(["POST"])
@verificar_roles(["admin"])
def sincronizar_firebase(request):
    exec(open("apps/usuarios_roles/scripts/sincronizar_firebase.py").read())
    return Response({"message": "Sincronización completa"})
