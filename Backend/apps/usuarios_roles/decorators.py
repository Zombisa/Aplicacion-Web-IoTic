#decorador para verificar el token
# usuarios/decorators.py
from functools import wraps
from firebase_admin import auth
from django.http import JsonResponse

def verificar_token(view_func):
    @wraps(view_func)
    def wrapped_view(request, *args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JsonResponse({"error": "Token no proporcionado"}, status=401)
        
        token = auth_header.split(" ")[1]
        try:
            decoded = auth.verify_id_token(token)
            request.user_firebase = decoded
        except Exception as e:
            return JsonResponse({"error": f"Token inválido o expirado: {e}"}, status=401)
        
        return view_func(request, *args, **kwargs)
    return wrapped_view
