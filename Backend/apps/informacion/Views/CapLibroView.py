from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.usuarios_roles.models import Usuario
from apps.informacion.permissions import verificarToken
from apps.informacion.Models.CapLibro import CapLibro
from apps.informacion.Serializers.CapLibroSerializer import CapLibroSerializer
from django.conf import settings
from backend.serviceCloudflare.R2Client import s3

class CapLibroViewSet(viewsets.ModelViewSet):
    """CRUD de capítulos de libro con rol requerido y manejo de imágenes en R2.

    Roles: todos los endpoints validan `verificarToken.validarRol` (403 si falla).
    Imágenes: `file_path` → `image_r2` usando `R2_BUCKET_PATH`; eliminar imagen borra en R2 y limpia el campo.
    Errores comunes: 404 cuando el capítulo no existe; 400 en validación; 500 si falla Cloudflare R2.
    """

    queryset = CapLibro.objects.all()
    serializer_class = CapLibroSerializer

    @action(detail=False, methods=['post'], url_path='capitulo_libro')
    def agregar_capitulo_libro(self, request):
        """Crea un capítulo.

        Entrada: campos del modelo; opcional `file_path` para poblar `image_r2`.
        Salida: 201 con el capítulo creado; 400 si falla validación; 404 si el usuario no existe.
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

            serializer = CapLibroSerializer(data=data)
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
    
    @action(detail=True, methods=['put'], url_path='capitulo_libro')
    def editar_capitulo_libro(self, request, pk):
        """Actualiza parcialmente un capítulo por `pk`; mantiene el usuario original.

        Errores: 404 si no se encuentra; 400 si la validación falla.
        """
        if verificarToken.validarRol(request) is True:
            try:
                cap_libro = CapLibro.objects.get(pk=pk)
            except CapLibro.DoesNotExist:
                return Response({'error': 'Capítulo de libro no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            uid = verificarToken.obtenerUID(request)
            if cap_libro.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes editar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)
            
            serializer = CapLibroSerializer(cap_libro, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='capitulo_libro')
    def eliminar_capitulo_libro(self, request, pk):
        """Elimina un capítulo por `pk`; 404 si no existe."""
        if verificarToken.validarRol(request) is True:
            try:
                cap_libro = CapLibro.objects.get(pk=pk)
            except CapLibro.DoesNotExist:
                return Response({'error': 'Capítulo de libro no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
            uid = verificarToken.obtenerUID(request)
            if cap_libro.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes eliminar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)
            #eliminar imagen en el bucket de clouflare
            # extraer solo el nombre de la imagen
            image_path = cap_libro.image_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=image_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar la imagen en R2: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            #eliminar archivo en el bucket de clouflare
            # extraer solo el nombre del archivo
            file_path = cap_libro.file_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_FILES_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar el archivo en R2: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            cap_libro.delete()
            return Response({'Capítulo de libro eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=False, methods=['get'], url_path='capitulos_libro')
    def listar_capitulos_libro(self, request):
        """Lista todos los capítulos (requiere rol válido)."""
        if verificarToken.validarRol(request) is True:
            capitulos = CapLibro.objects.all()
            serializer = CapLibroSerializer(capitulos, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='imagen')
    def eliminar_imagen(self, request, pk):
        """Borra la imagen en R2 y limpia `image_r2`.

        Respuestas: 400 si no hay imagen; 500 si R2 falla; 200 en éxito.
        """
        if verificarToken.validarRol(request) is True:
            CapLibro = self.get_object()

            if not CapLibro.image_r2:
                return Response({"message": "Capitulo de libro no tiene imagen"}, status=status.HTTP_400_BAD_REQUEST)

            uid = verificarToken.obtenerUID(request)
            if CapLibro.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes editar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)
            
            # extraer solo el nombre del archivo
            file_path = CapLibro.image_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar la imagen en R2: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            # actualizar campo image_r2 a None 
            CapLibro.image_r2 = None
            CapLibro.save()
            return Response({"message": "imagen eliminada correctamente"}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['delete'], url_path='archivo')
    def eliminar_archivo(self, request, pk):
        if verificarToken.validarRol(request) is True:
            CapLibro = self.get_object()

            if not CapLibro.file_r2:
                return Response({"message": "Capitulo de libro no tiene archivo"}, status=status.HTTP_400_BAD_REQUEST)

            uid = verificarToken.obtenerUID(request)
            if CapLibro.usuario.uid_firebase != uid:
                return Response ({'error': 'Solo puedes editar tus publicaciones'}, status=status.HTTP_403_FORBIDDEN)

            # extraer solo el nombre del archivo
            file_path = CapLibro.file_r2.split("/")[-1]

            try:
                s3.delete_object(Bucket=settings.R2_BUCKET_FILES_NAME, Key=file_path)
            except Exception as e:
                return Response({"error": f"No se pudo eliminar el archivo en R2: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # actualizar producto 
            CapLibro.file_r2 = None
            CapLibro.save()
            return Response({"message": "Archivo eliminado correctamente"}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)
        
    
    @action(detail=False, methods=['get'], url_path='imagenes')
    def listar_imagenes(self, request):
        """Lista URLs públicas actuales del bucket R2 (sin filtros)."""
        try:
            response = s3.list_objects_v2(Bucket=settings.R2_BUCKET_NAME)
            archivos = [obj['Key'] for obj in response.get('Contents', [])]
            # Construir URLs públicas
            urls = [f"{settings.R2_BUCKET_PATH}/{key}" for key in archivos]
            return Response(urls)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], url_path='misCapLibros')
    def misCapLibros(self, request):
        """Lista los capitulo de libros que ha publicado el usuario (requiere rol válido)."""
        if verificarToken.validarRol(request) is True:
            cap_libros = CapLibro.objects.all()
            caplibrosPublicados = []
            uid = verificarToken.obtenerUID(request)
            for caplibro in cap_libros:
                if caplibro.usuario.uid_firebase == uid:
                    caplibrosPublicados.append(caplibro)
            if len(caplibrosPublicados) == 0:
                return Response({'message': 'No tienes capitulos de libros publicados'})
            serializer = CapLibroSerializer(caplibrosPublicados, many=True)
            return Response(serializer.data)
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)