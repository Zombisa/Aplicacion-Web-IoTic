from firebase_admin import auth, db, firestore
from .models import Usuario
from django.contrib.auth.hashers import make_password


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
