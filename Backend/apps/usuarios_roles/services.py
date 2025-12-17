from firebase_admin import auth, db, firestore
from .models import Usuario, Rol
from django.contrib.auth.hashers import make_password
import logging

logger = logging.getLogger(__name__)

def crear_usuario(data):
    """
    Crea un usuario en Firebase Auth, Firestore y PostgreSQL de forma transaccional.

    Pasos:
        1) Crea el usuario en Firebase Authentication.
        2) Asigna el rol (custom claim) en Firebase.
        3) Persiste el usuario en PostgreSQL.
        4) Sincroniza el documento en Firestore.

    En caso de fallo, revierte en los tres sistemas (Auth, Firestore, PostgreSQL).

    Args:
        data (dict): email, contrasena, nombre, apellido, rol (objeto Rol).

    Returns:
        Usuario: instancia creada.

    Raises:
        Exception: si ocurre cualquier error en alguno de los sistemas.
    """

    uid_firebase = None
    usuario = None
    try:
        # Crear usuario en Firebase Authentication
        user_record = auth.create_user(
            email=data['email'],
            password=data['contrasena']
        )
        uid_firebase = user_record.uid

        # Asignar rol (claim) en Firebase
        asignar_rol_firebase(uid_firebase, data['rol'].nombre)

        # 2. Guardar usuario en PostgreSQL
        usuario = Usuario.objects.create(
            uid_firebase=uid_firebase,
            nombre=data['nombre'],
            apellido=data['apellido'],
            email=data['email'],
            contrasena=make_password(data['contrasena']), 
            estado=True,
            rol=data['rol']
        )

        # 3. Guardar en Firebase Database
        # crear coleccion y se usa el uid del usuario como ID del documento
        db = firestore.client() 
        db.collection("usuarios").document(uid_firebase).set({
            'nombre': usuario.nombre,
            'apellido': usuario.apellido,
            'email': usuario.email,
            'contrasena': usuario.contrasena,
            'fechaRegistro': firestore.SERVER_TIMESTAMP,
            'estado': usuario.estado,
            'rol': usuario.rol.nombre
        })

        return usuario

    except Exception as e:
        print(f" Error al crear usuario: {e}")

        # Eliminar el documento de Firestore si ya fue creado
        try:
            if uid_firebase:
                db = firestore.client()
                doc_ref = db.collection('usuarios').document(uid_firebase)
                if doc_ref.get().exists:
                    doc_ref.delete()
        except Exception as firestore_error:
            print(f" Error eliminando documento Firestore: {firestore_error}")

        # Eliminar de PostgreSQL si ya fue guardado
        try:
            if usuario:
                usuario.delete()
        except Exception as db_error:
            print(f" Error eliminando usuario de PostgreSQL: {db_error}")

        # Eliminar del Authentication de Firebase
        try:
            if uid_firebase:
                auth.delete_user(uid_firebase)
        except Exception as fb_error:
            print(f" Error eliminando usuario de Firebase Auth: {fb_error}")

        # Re-lanzar la excepción para que la vista maneje la respuesta
        raise Exception(f"Error al crear usuario: {str(e)}")
    
    
def asignar_rol_firebase(uid_firebase, rol_nombre):
    """Asigna rol a un usuario ajustando sus custom claims en Firebase."""
    try:
        auth.set_custom_user_claims(uid_firebase, {"role": rol_nombre})
        return True
    except Exception as e:
        print(f"Error asignando rol: {e}")
        return False

def sincronizar_usuarios_firebase():
    """
    Sincroniza usuarios de Firebase Authentication a PostgreSQL.
    Retorna: dict con estadísticas de la sincronización
    """
    logger.info("🔄 Iniciando sincronización de usuarios Firebase → PostgreSQL")
    
    ROLES_VALIDOS = ["admin", "mentor"]
    stats = {
        "creados": 0,
        "actualizados": 0,
        "errores": 0,
        "total_procesados": 0
    }

    try:
        for user in auth.list_users().iterate_all():
            stats["total_procesados"] += 1
            
            try:
                uid = user.uid
                email = user.email
                nombre_default = email.split("@")[0] if email else "sin_nombre"

                # Leer rol desde custom claims
                claims = user.custom_claims or {}
                rol_name_claim = (claims.get("role") or "").lower().strip()

                rol_obj = None
                if rol_name_claim in ROLES_VALIDOS:
                    rol_obj, _ = Rol.objects.get_or_create(nombre=rol_name_claim)

                # Crear o actualizar usuario
                usuario, creado = Usuario.objects.get_or_create(
                    uid_firebase=uid,
                    defaults={
                        "email": email,
                        "nombre": nombre_default,
                        "apellido": "",
                        "contrasena": "",
                        "estado": True,
                        "rol": rol_obj
                    }
                )

                if not creado:
                    # Actualizar solo si hay cambios
                    cambios = False
                    if usuario.email != email:
                        usuario.email = email
                        cambios = True
                    if usuario.nombre != nombre_default:
                        usuario.nombre = nombre_default
                        cambios = True
                    if usuario.rol != rol_obj:
                        usuario.rol = rol_obj
                        cambios = True
                    if not usuario.estado:
                        usuario.estado = True
                        cambios = True
                    
                    if cambios:
                        usuario.save()
                        stats["actualizados"] += 1
                else:
                    stats["creados"] += 1

                rol_texto = rol_obj.nombre if rol_obj else "Sin rol"
                logger.debug(f"✓ Usuario: {uid} ({email}) - Rol: {rol_texto}")
                
            except Exception as e:
                stats["errores"] += 1
                logger.error(f"❌ Error sincronizando usuario {user.uid}: {str(e)}")
                continue

        logger.info(
            f"✅ Sincronización completa - "
            f"Creados: {stats['creados']}, "
            f"Actualizados: {stats['actualizados']}, "
            f"Errores: {stats['errores']}, "
            f"Total: {stats['total_procesados']}"
        )
        return stats
        
    except Exception as e:
        logger.error(f"❌ Error crítico en sincronización: {str(e)}")
        raise