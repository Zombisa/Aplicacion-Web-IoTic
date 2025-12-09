from firebase_admin import auth
from apps.usuarios_roles.models import Usuario, Rol

print("Iniciando sincronización de usuarios Firebase → PostgreSQL...\n")

# Roles permitidos: admin o mentor (en minúsculas)
ROLES_VALIDOS = ["admin", "mentor"]

for user in auth.list_users().iterate_all():

    uid = user.uid
    email = user.email
    nombre_default = email.split("@")[0] if email else "sin_nombre"

    # ============================
    # LEER ROL DESDE CUSTOM CLAIM
    # ============================
    claims = user.custom_claims or {}
    rol_name_claim = (claims.get("role") or "").lower().strip()

    # Validar rol
    rol_obj = None
    if rol_name_claim in ROLES_VALIDOS:
        rol_obj, _ = Rol.objects.get_or_create(nombre=rol_name_claim)
    # Si el rol no es válido, rol_obj queda como None

    # ============================
    # CREAR O ACTUALIZAR USUARIO
    # ============================
    usuario, creado = Usuario.objects.get_or_create(
        uid_firebase=uid,
        defaults={
            "email": email,
            "nombre": nombre_default,
            "apellido": "",
            "contrasena": "",
            "estado": True,
            "rol": rol_obj  # Puede ser None si no tiene rol válido
        }
    )

    # Si ya existía → actualizar datos y rol
    if not creado:
        usuario.email = email
        usuario.nombre = nombre_default
        usuario.estado = True
        usuario.rol = rol_obj  # Reemplaza el rol anterior (puede ser None)
        usuario.save()

    rol_texto = rol_obj.nombre if rol_obj else "Sin rol"
    print(f"Usuario sincronizado: {uid} ({email}) - Rol: {rol_texto}")

print("\nSincronización completa.")
