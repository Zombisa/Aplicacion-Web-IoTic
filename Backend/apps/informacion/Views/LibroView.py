from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.Libro import Libro
from apps.informacion.Serializers.LibroSerializer import LibroSerializer
from django.conf import settings
import uuid
from backend.serviceCloudflare.R2Service import generar_url_firmada
from backend.serviceCloudflare.R2Client import s3

class LibroViewSet(viewsets.ModelViewSet):
    """CRUD de libros con rol requerido y manejo de imágenes en R2.

    Roles: todas las acciones usan `verificarToken.validarRol` (403 si falla).
    Imágenes: `file_path` → `image_r2`; eliminar imagen borra en R2 y limpia el campo.
    Errores: 404 si no existe; 400 validación; 500 fallos R2.
    """

    queryset = Libro.objects.all()
    serializer_class = LibroSerializer

    @action(detail=False, methods=['post'], url_path='libro')
    def agregar_libro(self, request):
        """Crea un libro.

        Entrada: datos del libro; opcional `file_path` para `image_r2`.
        Salida: 201 con libro creado; 404 si no se halla usuario; 400 si falla validación.
        """
        if verificarToken.validarRol(request) is True:
            data = request.data.copy()
            # construir la URL completa para la imagen
            image_path = data.pop("image_path", None)

            if image_path:
                # crear la URL usando tu dominio público del bucket
                full_url = f"{settings.R2_BUCKET_PATH}/{image_path}"
                data["image_r2"] = full_url
            
            # construir la url completa para el archivo
            archivo_path = data.pop("archivo_path", None)
            
            if archivo_path:
                full_url_archivo = f"{settings.R2_BUCKET_FILES_PATH}/{archivo_path}"
                data["file_r2"] = full_url_archivo
            serializer = LibroSerializer(data=data)
            if serializer.is_valid():
                user_uid = verificarToken.obtenerUID(request)
                try:
                    usuario = Usuario.objects.get(uid_firebase=user_uid)
                except:
                    return Response({'error': 'usuario no encontrado en la base de datos'}, status=status.HTTP_404_NOT_FOUND)
                serializer.save(usuario=usuario)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
        
    @action(detail=True, methods=['put'], url_path='libro')
    def editar_libro(self, request, pk):
        """Actualiza parcialmente un libro por `pk`; conserva usuario; 404/400 en errores."""
        if verificarToken.validarRol(request) is True:
            try:
                libro = Libro.objects.get(pk=pk)
            except Libro.DoesNotExist:
                return Response({'error': 'Libro no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
            uid = verificarToken.obtenerUID(request)
            if libro.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes editar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)
            
            #gestion para actualizar una imagen (se elimina y se sube otra en r2)
            data = request.data.copy()
            image_path = data.pop('image_path', None)
            if image_path and not data.get('image_r2'):
                data['image_r2'] = f"{settings.R2_BUCKET_PATH}/{image_path}"
            
            nueva_imagen = data.get('image_r2')
            if nueva_imagen and libro.image_r2 and nueva_imagen != libro.image_r2:
                imagen_anterior = libro.image_r2
                filename = imagen_anterior.split("/")[-1]
                try:
                    s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=filename)
                except Exception as e:
                    # Log del error pero continuar con la actualización
                    print(f"Error eliminando imagen anterior de R2: {str(e)}")
            
            #gestion para actualizar un archivo (se elimina y se sube otro en r2)
            file_path = data.pop('archivo_path', None)
            if file_path and not data.get('file_r2'):
                data['file_r2'] = f"{settings.R2_BUCKET_PATH}/{file_path}"
                
            nuevo_archivo = data.get('file_r2')
            if nuevo_archivo and libro.file_r2 and nuevo_archivo != libro.file_r2:
                archivo_anterior = libro.file_r2
                filename = archivo_anterior.split("/")[-1]
                try:
                    s3.delete_object(Bucket=settings.R2_BUCKET_FILES_NAME, Key=filename)
                except Exception as e:
                    print(f"Error eliminando archivo anterior de R2: {str(e)}")           
                
            serializer = LibroSerializer(libro, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='Libros')
    def eliminar_libro(self, request, pk):
        """Elimina un libro por `pk`; 404 si no existe."""
        if verificarToken.validarRol(request) is True:
            try:
                libro = Libro.objects.get(pk=pk)
            except Libro.DoesNotExist:
                return Response({'error': 'Libro no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
            uid = verificarToken.obtenerUID(request)
            if libro.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes editar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)
            
            #eliminar imagen en el bucket de clouflare
            # extraer solo el nombre de la imagen
            image_path = libro.image_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=image_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar la imagen en R2: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            #eliminar archivo en el bucket de clouflare
            # extraer solo el nombre del archivo
            file_path = libro.file_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_FILES_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar el archivo en R2: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            libro.delete()
            return Response({'Libro eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
        
    @action(detail=False, methods=['get'], url_path='Libros')
    def listar_libros(self, request):
        """Lista todos los libros (requiere rol válido)."""
        if verificarToken.validarRol(request) is True:
            libros = Libro.objects.all()
            serializer = LibroSerializer(libros, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='imagen')
    def eliminar_imagen(self, request, pk):
        """Borra la imagen en R2 y limpia `image_r2` (400 sin imagen; 500 si R2 falla)."""
        if verificarToken.validarRol(request) is True:
            libro = self.get_object()

            if not libro.image_r2:
                return Response({"message": "El libro no tiene imagen"}, status=status.HTTP_400_BAD_REQUEST)
            
            uid = verificarToken.obtenerUID(request)
            if libro.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes editar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)
            # extraer solo el nombre del archivo
            file_path = libro.image_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar la imagen en R2: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # actualizar campo image_r2 a None 
            libro.image_r2 = None
            libro.save()
            return Response({"message": "imagen eliminada correctamente"}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
        
    
    @action(detail=True, methods=['delete'], url_path='archivo')
    def eliminar_archivo(self, request, pk):
        if verificarToken.validarRol(request) is True:
            Libro = self.get_object()

            if not Libro.file_r2:
                return Response({"message": "Libro no tiene archivo"}, status=status.HTTP_400_BAD_REQUEST)

            uid = verificarToken.obtenerUID(request)
            if Libro.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes eliminar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)
            # extraer solo el nombre del archivo
            file_path = Libro.file_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_FILES_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar el archivo en R2: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # actualizar producto 
            Libro.file_r2 = None
            Libro.save()
            return Response({"message": "Archivo eliminado correctamente"}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
        
    
    @action(detail=False, methods=['get'], url_path='imagenes')
    def listar_imagenes(self, request):
        """Devuelve las URLs públicas actuales del bucket R2."""
        try:
            response = s3.list_objects_v2(Bucket=settings.R2_BUCKET_NAME)
            archivos = [obj['Key'] for obj in response.get('Contents', [])]
            # Construir URLs públicas
            urls = [f"{settings.R2_BUCKET_PATH}/{key}" for key in archivos]
            return Response(urls)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], url_path='misLibros')
    def misLibros(self, request):
        """Lista los libros que ha publicado el usuario (requiere rol válido)."""
        if verificarToken.validarRol(request) is True:
            libros = Libro.objects.all()
            librosPublicados = []
            uid = verificarToken.obtenerUID(request)
            for libro in libros:
                if libro.usuario.uid_firebase == uid:
                    librosPublicados.append(libro)
            if len(librosPublicados) == 0:
                return Response({'message': 'No tienes libros publicados'})
            serializer = LibroSerializer(librosPublicados, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['get'], url_path='lib')
    def getLibroById(self, request, pk):
        """Obtiene un libro por ID (requiere rol válido)."""

        if verificarToken.validarRol(request) is True:
            try:
                lib = Libro.objects.get(pk=pk)
            except Libro.DoesNotExist:
                return Response({'error': 'libro no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            serializer = LibroSerializer(lib)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)