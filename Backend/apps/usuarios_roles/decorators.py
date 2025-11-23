from functools import wraps
from firebase_admin import auth
from django.http import JsonResponse
from apps.usuarios_roles.models import Usuario, Rol


# ======================================================
#   VERIFICAR TOKEN Y SINCRONIZAR USUARIO
# ======================================================

def verificar_token(view_func):
    @wraps(view_func)
    def wrapped(request, *args, **kwargs):

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JsonResponse({"error": "Token no proporcionado"}, status=401)

        token = auth_header.split(" ")[1]

        try:
            decoded = auth.verify_id_token(token)
        except Exception as e:
            return JsonResponse({"error": f"Token inválido: {str(e)}"}, status=401)

        uid = decoded.get("uid")
        email = decoded.get("email")
        role_claim = (decoded.get("role") or "usuario").lower().strip()

        # ------------------------------
        #  Sincronizar usuario en BD
        # ------------------------------
        usuario, creado = Usuario.objects.get_or_create(
            uid_firebase=uid,
            defaults={
                "email": email,
                "nombre": email.split("@")[0],
                "apellido": "",
                "contrasena": "",
                "estado": True,
            }
        )

        # Asignar rol si existe
        try:
            rol_obj = Rol.objects.get(nombre__iexact=role_claim)
            usuario.rol = rol_obj
            usuario.save()
        except Rol.DoesNotExist:
            pass

        # Guardar objetos en request
        request.user_local = usuario
        request.user_firebase = decoded
        request.user_role = role_claim

        return view_func(request, *args, **kwargs)

    return wrapped



# ======================================================
#   VERIFICAR ROLES
# ======================================================

def verificar_roles(roles_permitidos):
    roles_permitidos = [r.lower().strip() for r in roles_permitidos]

    def decorator(view_func):
        @wraps(view_func)
        def wrapped(request, *args, **kwargs):

            # Leer rol del token
            token_role = getattr(request, "user_role", "").lower().strip()

            # Leer rol de BD
            db_role = ""
            if hasattr(request, "user_local") and request.user_local.rol:
                db_role = request.user_local.rol.nombre.lower().strip()

            if token_role not in roles_permitidos and db_role not in roles_permitidos:
                return JsonResponse({
                    "error": f"Permisos insuficientes. Este recurso requiere: {roles_permitidos}",
                    "token_role": token_role,
                    "db_role": db_role
                }, status=403)

            return view_func(request, *args, **kwargs)

        return wrapped
    return decorator
