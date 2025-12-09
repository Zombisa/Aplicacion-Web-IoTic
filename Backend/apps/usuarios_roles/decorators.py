from functools import wraps
from firebase_admin import auth
from django.http import JsonResponse
from apps.usuarios_roles.models import Usuario, Rol


def verificar_token(view_func):
    """
    Verifica el JWT de Firebase y sincroniza el usuario con la base de datos local.

    Flujo:
        1) Lee "Authorization: Bearer <token>" y valida el token con Firebase.
        2) Crea/actualiza el usuario en PostgreSQL con el UID y email del token.
        3) Intenta asociar el rol indicado en el claim "role" si existe en BD.
        4) Adjunta en request: user_local, user_firebase (token decodificado) y user_role.

    Respuestas:
        - 401 si falta el token o es inválido.
        - Continúa a la vista protegida si es válido.

    Úsalo con @verificar_token en vistas basadas en función.
    """
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
        role_claim = (decoded.get("role") or "").lower().strip()

        # Normalizar claim a los nombres oficiales de rol
        ROLES_PERMITIDOS = {
            "admin": "Administrador",
            "administrador": "Administrador",
            "mentor": "Mentor",
        }
        role_normalizado = ROLES_PERMITIDOS.get(role_claim, "")

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

        # Asignar rol si el claim es válido (Administrador/Mentor). Si no, dejar sin rol.
        if role_normalizado:
            try:
                rol_obj = Rol.objects.get(nombre__iexact=role_normalizado)
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



def verificar_roles(roles_permitidos):
    """
    Autoriza acceso sólo si el usuario tiene alguno de los roles permitidos.

    Compara roles provenientes del token (user_role) y de la BD (user_local.rol).
    Si ninguno coincide, responde 403 con detalle de roles detectados.

    Args:
        roles_permitidos (list[str]): Ej. ['admin', 'mentor'] o ['Administrador', 'Mentor']
    """
    # Mapeo de normalización para compatibilidad
    ROLES_MAP = {
        "admin": "administrador",
        "mentor": "mentor",
        "administrador": "administrador"
    }
    
    # Normalizar roles permitidos
    roles_normalizados = []
    for r in roles_permitidos:
        r_lower = r.lower().strip()
        roles_normalizados.append(ROLES_MAP.get(r_lower, r_lower))

    def decorator(view_func):
        @wraps(view_func)
        def wrapped(request, *args, **kwargs):
            """Wrapper que aplica la validación de rol y retorna 403 si no coincide."""

            # Leer rol del token y normalizarlo
            token_role = getattr(request, "user_role", "").lower().strip()
            token_role_normalizado = ROLES_MAP.get(token_role, token_role)

            # Leer rol de BD y normalizarlo
            db_role = ""
            db_role_normalizado = ""
            if hasattr(request, "user_local") and request.user_local.rol:
                db_role = request.user_local.rol.nombre.lower().strip()
                db_role_normalizado = ROLES_MAP.get(db_role, db_role)

            if token_role_normalizado not in roles_normalizados and db_role_normalizado not in roles_normalizados:
                return JsonResponse({
                    "error": f"Permisos insuficientes. Este recurso requiere: {roles_permitidos}",
                    "token_role": token_role,
                    "db_role": db_role
                }, status=403)

            return view_func(request, *args, **kwargs)

        return wrapped

    return decorator
