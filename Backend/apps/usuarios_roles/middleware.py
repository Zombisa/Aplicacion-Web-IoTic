from firebase_admin import auth
from django.http import JsonResponse

def firebase_auth_middleware(get_response):
    def middleware(request):
        token = request.headers.get("Authorization")
        if token:
            try:
                # Token viene como "Bearer <TOKEN>"
                decoded_token = auth.verify_id_token(token.split(" ")[1])
                request.firebase_user = decoded_token
            except Exception as e:
                return JsonResponse({"error": "Token inválido o expirado"}, status=401)
        else:
            request.firebase_user = None
        return get_response(request)
    return middleware
