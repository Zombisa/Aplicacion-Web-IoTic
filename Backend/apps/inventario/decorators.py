from functools import wraps
from firebase_admin import auth
from django.http import JsonResponse
from apps.usuarios_roles.models import Usuario, Rol

def verificar_token(view_func):
    """
    Decorador para verificar y validar el token JWT de Firebase.
    
    Realiza las siguientes operaciones:
    1. Extrae el token del header "Authorization: Bearer <token>"
    2. Verifica el token con Firebase Authentication
    3. Sincroniza el usuario en la base de datos local
    4. Asigna el rol correspondiente al usuario
    5. Attachea información del usuario al objeto request
    
    Token requerido:
        Header: "Authorization: Bearer <JWT_token>"
    
    Información agregada a request:
        - request.user_local (Usuario): Objeto del usuario en BD
        - request.user_firebase (dict): Token decodificado de Firebase
        - request.user_role (str): Rol del usuario en minúsculas
    
    Sincronización automática:
        - Crea el usuario en BD si no existe (basado en uid de Firebase)
        - Actualiza el rol si existe en BD
        - Campos por defecto: nombre extraído del email, apellido vacío
    
    Returns:
        200 OK: Continúa con la vista si el token es válido
        401 Unauthorized: Si no hay token, token inválido o Firebase rechaza
        
    Errores comunes:
        - "Token no proporcionado": Falta header Authorization
        - "Token inválido: ...": Firebase rechaza el token
    
    Ejemplo de uso:
        @method_decorator(verificar_token, name='dispatch')
        class MiViewSet(viewsets.ModelViewSet):
            ...
        
    Nota: Usar con @method_decorator para vistas de clase
    """
    @wraps(view_func)
    def wrapped(request, *args, **kwargs):
        """
        Función wrapper que ejecuta la validación del token.
        
        Args:
            request: Objeto request de Django
            *args: Argumentos posicionales
            **kwargs: Argumentos con nombre
            
        Returns:
            Response: Resultado de view_func o error JSON
        """

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
        request.user_role = role_claim   # ← AHORA SÍ SE DEFINE

        return view_func(request, *args, **kwargs)

    return wrapped



# ======================================================
#   VERIFICAR ROLES
# ======================================================

def verificar_roles(roles_permitidos):
    """
    Decorador para verificar que el usuario tenga uno de los roles requeridos.
    
    Propósito:
        Controla el acceso a vistas/endpoints basado en los roles del usuario.
        Verifica roles tanto del token de Firebase como de la BD local.
    
    Funcionamiento:
        1. Extrae el rol del token Firebase (request.user_role)
        2. Extrae el rol de la base de datos (request.user_local.rol)
        3. Verifica si al menos uno coincide con los roles permitidos
        4. Permite o rechaza el acceso según corresponda
    
    Args:
        roles_permitidos (list): Lista de roles permitidos (ej: ['admin', 'mentor'])
    
    Validación:
        - Case-insensitive (convierte a minúsculas)
        - Ignora espacios al inicio/final
        - Verifica contra ambas fuentes (token + BD)
    
    Returns:
        200 OK: Si el usuario tiene rol permitido
        403 Forbidden: Si no tiene permisos suficientes (incluye detalles del rol)
    
    Soporta dos tipos de funciones:
        1. Métodos de clase (ViewSet): primer argumento es 'self'
        2. Funciones decoradas: primer argumento es 'request'
    
    Ejemplo de uso en ViewSet:
        @method_decorator(verificar_roles(['admin', 'mentor']), name='crear_prestamo')
        @action(detail=False, methods=['post'], url_path='crear')
        def crear_prestamo(self, request):
            ...
    
    Error response:
        {
            "error": "Permisos insuficientes. Este recurso requiere: ['admin']",
            "token_role": "usuario",
            "db_role": "usuario"
        }
    """
    roles_permitidos = [r.lower().strip() for r in roles_permitidos]

    def decorator(func):
        """
        Decorador interno que wrappea la función/método.
        
        Args:
            func: Función o método a proteger
            
        Returns:
            wrapper: Función decorada con validación de roles
        """
        @wraps(func)
        def wrapper(self_or_request, *args, **kwargs):
            """
            Wrapper que valida los roles.
            
            Soporta dos contextos:
            1. self (método de ViewSet): Extrae request de self.request
            2. request (función): Usa request directamente
            
            Args:
                self_or_request: self (método) o request (función)
                *args: Argumentos posicionales
                **kwargs: Argumentos con nombre
                
            Returns:
                Response: Resultado de func() o error 403
            """
            
            if hasattr(self_or_request, 'request'):
                # Es un método (self)
                request = self_or_request.request
            else:
                # Es una función (request directamente)
                request = self_or_request

            # Leer rol del token
            token_role = getattr(request, "user_role", "").lower().strip()

            # Leer rol de BD
            db_role = ""
            if hasattr(request, "user_local") and request.user_local and request.user_local.rol:
                db_role = request.user_local.rol.nombre.lower().strip()

            if token_role not in roles_permitidos and db_role not in roles_permitidos:
                return JsonResponse({
                    "error": f"Permisos insuficientes. Este recurso requiere: {roles_permitidos}",
                    "token_role": token_role,
                    "db_role": db_role
                }, status=403)

            return func(self_or_request, *args, **kwargs)

        return wrapper
    return decorator
