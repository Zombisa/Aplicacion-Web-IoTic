from functools import wraps
from firebase_admin import auth
from django.http import JsonResponse

def verificar_token(roles_permitidos=None):
    """
    roles_permitidos: lista opcional. Ej:
      @method_decorator(verificar_token(["admin"]), name='dispatch')
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            auth_header = request.headers.get("Authorization")

            if not auth_header or not auth_header.startswith("Bearer "):
                return JsonResponse({"error": "No se proporcionó un token válido"}, status=401)

            token = auth_header.split(" ")[1]

            try:
                decoded_token = auth.verify_id_token(token)
                request.user_firebase = decoded_token
            except auth.ExpiredIdTokenError:
                return JsonResponse({"error": "Token expirado"}, status=401)
            except auth.InvalidIdTokenError:
                return JsonResponse({"error": "Token inválido"}, status=401)
            except Exception:
                return JsonResponse({"error": "No se pudo validar el token"}, status=401)

            if roles_permitidos:
                user_role = decoded_token.get("role")
                if user_role not in roles_permitidos:
                    return JsonResponse(
                        {"error": f"Permisos insuficientes. Este recurso requiere los roles: {roles_permitidos}"},
                        status=403
                    )

            return view_func(request, *args, **kwargs)

        return wrapped_view
    return decorator
