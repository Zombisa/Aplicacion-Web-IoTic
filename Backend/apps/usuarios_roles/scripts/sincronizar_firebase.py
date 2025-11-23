from firebase_admin import auth
from apps.usuarios_roles.models import Usuario, Rol

print("Iniciando sincronización de usuarios Firebase → PostgreSQL...\n")

# --- Validar que exista el rol por defecto ---
rol_por_defecto, _ = Rol.objects.get_or_create(nombre="usuario")

for user in auth.list_users().iterate_all():

    uid = user.uid
    email = user.email
    nombre_default = email.split("@")[0] if email else "sin_nombre"

    # ============================
    # LEER ROL DESDE CUSTOM CLAIM
    # ============================
    claims = user.custom_claims or {}
    rol_name = claims.get("role", "usuario")

    # Buscar el rol en la BD, si no existe crearlo
    rol_obj, _ = Rol.objects.get_or_create(nombre=rol_name)

    # ============================
    # CREAR O ACTUALIZAR USUARIO
    # ============================
    usuario, creado = Usuario.objects.get_or_create(
        uid_firebase=uid,
        defaults={
            "email": email,
            "nombre": nombre_default,
            "apellido": "",
            "contrasena": "",        # No guardamos contraseña local
            "estado": True,
            "rol": rol_obj           
        }
    )

    # Si ya existía → actualizar datos y rol
    if not creado:
        usuario.email = email
        usuario.nombre = nombre_default
        usuario.estado = True
        usuario.rol = rol_obj      # ← SIEMPRE asignar rol válido
        usuario.save()

    print(f"Usuario sincronizado: {uid} ({email}) - Rol asignado: {rol_obj.nombre}")

print("\nSincronización completa.")
