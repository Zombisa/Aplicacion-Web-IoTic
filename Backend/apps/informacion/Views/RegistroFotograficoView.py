from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.RegistroFotografico import RegistroFotografico
from apps.informacion.Serializers.RegistroFotograficoSerializer import RegistroFotograficoSerializer
from django.conf import settings
from backend.serviceCloudflare.R2Service import generar_url_firmada
from backend.serviceCloudflare.R2Client import s3

class RegistroFotograficoViewSet(viewsets.ModelViewSet):
    """CRUD de registros fotográficos con manejo de fotos en R2.

    Acceso: lecturas públicas; crear/editar/eliminar requieren `verificarToken.validarRol`.
    Fotos: `file_path` → `foto_r2`; eliminar registro borra la foto en R2.
    Errores: 404 si no existe; 400 validación; 500 fallos R2.
    """

    queryset = RegistroFotografico.objects.all()
    serializer_class = RegistroFotograficoSerializer

    def create(self, request):
        """Crea un registro fotográfico.

        Entrada: datos del registro; obligatorio `file_path` para `foto_r2`.
        Salida: 201 con registro creado; 400 si falta foto o usuario no encontrado.
        """
        if verificarToken.validarRol(request) is True:
            data = request.data.copy()
            
            # Validar que file_path (foto) sea obligatorio
            file_path = data.pop("file_path", None)
            
            if not file_path:
                return Response({'error': 'El campo file_path (foto) es obligatorio'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Construir la URL completa para la foto
            full_url = f"{settings.R2_BUCKET_PATH}/{file_path}"
            data["foto_r2"] = full_url
            
            serializer = RegistroFotograficoSerializer(data=data)
            if serializer.is_valid():
                user_uid = verificarToken.obtenerUID(request)
                try:
                    usuario = Usuario.objects.get(uid_firebase=user_uid)
                except:
                    return Response({'error': 'usuario no encontrado en la base de datos'}, 
                                  status=status.HTTP_404_NOT_FOUND)
                serializer.save(usuario=usuario)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)

    def update(self, request, pk=None):
        """Actualiza completamente un registro fotográfico."""
        if verificarToken.validarRol(request) is True:
            try:
                registro = RegistroFotografico.objects.get(pk=pk)
            except RegistroFotografico.DoesNotExist:
                return Response({'error': 'Registro fotográfico no encontrado'}, 
                              status=status.HTTP_404_NOT_FOUND)
            
            # Obtener rol del usuario
            auth_header = request.headers.get('Authorization')
            token = auth_header.split(' ')[1]
            from firebase_admin import auth
            decoded_token = auth.verify_id_token(token)
            role = decoded_token.get('role')
            
            # Admin puede editar cualquier registro, mentor solo el suyo
            if role != 'admin':
                uid = verificarToken.obtenerUID(request)
                if registro.usuario.uid_firebase != uid:
                    return Response({'error': 'Solo puedes editar tus registros'}, 
                                  status=status.HTTP_403_FORBIDDEN)
            
            data = request.data.copy()
            
            # Si se proporciona una nueva foto, actualizar la ruta en R2 y eliminar la anterior
            file_path = data.pop("file_path", None)
            if file_path:
                # Eliminar la foto anterior en R2
                if registro.foto_r2:
                    old_file_path = registro.foto_r2.split("/")[-1]
                    try:
                        s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=old_file_path)
                    except Exception as e:
                        return Response({"error": f"No se pudo eliminar la foto anterior en R2: {str(e)}"},
                                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                # Asignar la nueva foto
                full_url = f"{settings.R2_BUCKET_PATH}/{file_path}"
                data["foto_r2"] = full_url
            
            serializer = RegistroFotograficoSerializer(registro, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)

    def destroy(self, request, pk=None):
        """Elimina un registro fotográfico y su foto en R2."""
        if verificarToken.validarRol(request) is True:
            try:
                registro = RegistroFotografico.objects.get(pk=pk)
            except RegistroFotografico.DoesNotExist:
                return Response({'error': 'Registro fotográfico no encontrado'}, 
                              status=status.HTTP_404_NOT_FOUND)
            
            # Obtener rol del usuario
            auth_header = request.headers.get('Authorization')
            token = auth_header.split(' ')[1]
            from firebase_admin import auth
            decoded_token = auth.verify_id_token(token)
            role = decoded_token.get('role')
            
            # Admin puede eliminar cualquier registro, mentor solo el suyo
            if role != 'admin':
                uid = verificarToken.obtenerUID(request)
                if registro.usuario.uid_firebase != uid:
                    return Response({'error': 'Solo puedes eliminar tus registros'}, 
                                  status=status.HTTP_403_FORBIDDEN)
            
            # Eliminar foto en el bucket de Cloudflare
            if registro.foto_r2:
                file_path = registro.foto_r2.split("/")[-1]
                try:
                    s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=file_path)
                except Exception as e:
                    return Response({"error": f"No se pudo eliminar la foto en R2: {str(e)}"},
                                  status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            registro.delete()
            return Response({'message': 'Registro fotográfico eliminado correctamente'}, 
                          status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
        
    def list(self, request):
        """Lista pública de registros fotográficos."""
        registros = RegistroFotografico.objects.all()
        serializer = RegistroFotograficoSerializer(registros, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        """Detalle público de un registro fotográfico."""
        try:
            registro = RegistroFotografico.objects.get(pk=pk)
            serializer = RegistroFotograficoSerializer(registro)
            return Response(serializer.data)
        except RegistroFotografico.DoesNotExist:
            return Response({'error': 'Registro fotográfico no encontrado'}, 
                          status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'], url_path='public')
    def list_public(self, request):
        """Lista pública sin autenticación."""
        registros = RegistroFotografico.objects.all()
        serializer = RegistroFotograficoSerializer(registros, many=True)
        return Response(serializer.data)
