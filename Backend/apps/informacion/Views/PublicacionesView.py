from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from apps.informacion.permissions import verificarToken
from apps.usuarios_roles.models import Usuario
from apps.informacion.Models.CapLibro import CapLibro
from apps.informacion.Models.Curso import Curso
from apps.informacion.Models.Evento import Evento
from apps.informacion.Models.Jurado import Jurado
from apps.informacion.Models.Libro import Libro
from apps.informacion.Models.MaterialDidactico import MaterialDidactico
from apps.informacion.Models.Noticia import Noticia
from apps.informacion.Models.ParticipacionComitesEv import ParticipacionComitesEv
from apps.informacion.Models.ProcesoTecnica import ProcesoTecnica
from apps.informacion.Models.Revista import Revista
from apps.informacion.Models.Software import Software
from apps.informacion.Models.TrabajoEventos import TrabajoEventos
from apps.informacion.Models.TutoriaConcluida import TutoriaConcluida
from apps.informacion.Models.TutoriaEnMarcha import TutoriaEnMarcha 
from apps.informacion.Serializers.CapLibroSerializer import CapLibroSerializer
from apps.informacion.Serializers.CursoSerializer import CursoSerializer
from apps.informacion.Serializers.EventoSerializer import EventoSerializer
from apps.informacion.Serializers.JuradoSerializer import JuradoSerializer
from apps.informacion.Serializers.LibroSerializer import LibroSerializer
from apps.informacion.Serializers.MaterialDidacticoSerializer import MaterialDidacticoSerializer
from apps.informacion.Serializers.NoticiaSerializer import NoticiaSerializer
from apps.informacion.Serializers.ParticipacionComitesEvSerializer import ParticipacionComitesEvSerializer
from apps.informacion.Serializers.ProcesoTecnicaSerializer import ProcesoTecnicaSerializer
from apps.informacion.Serializers.RevistaSerializer import RevistaSerializer
from apps.informacion.Serializers.SoftwareSerializer import SoftwareSerializer
from apps.informacion.Serializers.TrabajoEventosSerializer import TrabajoEventosSerializer
from apps.informacion.Serializers.TutoriaConcluidaSerializer import TutoriaConcluidaSerializer
from apps.informacion.Serializers.TutoriaEnMarchaSerializer import TutoriaEnMarchaSerializer 

class PublicacionesViewSet(viewsets.ViewSet):
    
    @action(detail=True, methods=['get'], url_path='Publicaciones')
    def publicaciones_usuario(self, request, pk=None):
        """Devuelve todas las publicaciones de un usuario por `pk`."""
        
        if verificarToken.validarRol(request) is True:
            #validar que el usuario exista
            try:
                usuario = Usuario.objects.get(pk=pk)
            except Usuario.DoesNotExist:
                return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
            # Filtrar publicaciones por usuario
            capLibros = CapLibro.objects.filter(usuario_id=pk)
            cursos = Curso.objects.filter(usuario_id=pk)
            eventos = Evento.objects.filter(usuario_id=pk)
            jurados = Jurado.objects.filter(usuario_id=pk)
            libros = Libro.objects.filter(usuario_id=pk)
            mts = MaterialDidactico.objects.filter(usuario_id=pk)
            noticias = Noticia.objects.filter(usuario_id=pk)
            pcs = ParticipacionComitesEv.objects.filter(usuario_id=pk)
            pts = ProcesoTecnica.objects.filter(usuario_id=pk)
            revistas = Revista.objects.filter(usuario_id=pk)
            sof = Software.objects.filter(usuario_id=pk)
            tbjs = TrabajoEventos.objects.filter(usuario_id=pk)
            tutc = TutoriaConcluida.objects.filter(usuario_id=pk)
            tutm = TutoriaEnMarcha.objects.filter(usuario_id=pk)
            
            # Serializar cada conjunto
            capLibros_data = CapLibroSerializer(capLibros, many=True).data
            cursos_data = CursoSerializer(cursos, many=True).data
            eventos_data = EventoSerializer(eventos, many=True).data
            jurados_data = JuradoSerializer(jurados, many=True).data
            libros_data = LibroSerializer(libros, many=True).data
            mts_data = MaterialDidacticoSerializer(mts, many=True).data
            noticias_data = NoticiaSerializer(noticias, many=True).data
            pcs_data = ParticipacionComitesEvSerializer(pcs, many=True).data
            pts_data = ProcesoTecnicaSerializer(pts, many=True).data
            revistas_data = RevistaSerializer(revistas, many=True).data
            sof_data = SoftwareSerializer(sof, many=True).data
            tbjs_data = TrabajoEventosSerializer(tbjs, many=True).data
            tutc_data = TutoriaConcluidaSerializer(tutc, many=True).data
            tutm_data = TutoriaEnMarchaSerializer(tutm, many=True).data
            
            # Respuesta combinada
            return Response({
                'usuario_id': pk,
                'capitulos de libro': capLibros_data,
                'cursos': cursos_data,
                'eventos': eventos_data,
                'jurados': jurados_data,
                'libros': libros_data,
                'materiales didacticos': mts_data,
                'noticias': noticias_data,
                'participaciones en comites de evaluacion': pcs_data,
                'procesos o tecnicas': pts_data,
                'revistas': revistas_data,
                'software': sof_data,
                'trabajo en eventos': tbjs_data,
                'tutorias concluidas': tutc_data,
                'tutorias en marcha': tutm_data
            })
        else:
            return Response({'error': 'Token expirado o invalido.'},
                            status=status.HTTP_403_FORBIDDEN)