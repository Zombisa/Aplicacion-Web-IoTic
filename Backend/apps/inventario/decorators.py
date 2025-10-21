from functools import wraps
from firebase_admin import auth
from django.http import JsonResponse

def verificar_token(view_func):
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

        return view_func(request, *args, **kwargs)
    return wrapped_view
