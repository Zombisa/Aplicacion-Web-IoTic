from django.apps import AppConfig
import os
import sys

class UsuariosRolesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.usuarios_roles'
    def ready(self):
        """
        Se ejecuta cuando Django carga la aplicación.
        Aquí sincronizamos usuarios automáticamente.
        """
        # Evitar ejecución durante migraciones o en procesos secundarios
        if 'migrate' in sys.argv or 'makemigrations' in sys.argv:
            return
        
        # Solo ejecutar en el proceso principal (no en reloads durante desarrollo)
        if os.environ.get('RUN_MAIN') != 'true':
            return
        
        from .services import sincronizar_usuarios_firebase
        import logging
        
        logger = logging.getLogger(__name__)
        
        try:
            logger.info("Iniciando sincronización automática de usuarios Firebase...")
            stats = sincronizar_usuarios_firebase()
            logger.info(f"Sincronización automática completada: {stats}")
        except Exception as e:
            # No falla el inicio del servidor si la sincronización falla
            logger.warning(f"No se pudo sincronizar automáticamente: {e}")