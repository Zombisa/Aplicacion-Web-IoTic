import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseProductivityDTO } from '../../models/Common/BaseProductivityDTO';
import { BooksService } from './books.service';
import { CapBookService } from './cap-book.service';
import { CursoService } from './curso.service';
import { EventoService } from './evento.service';
import { RevistaService } from './revista.service';
import { SoftwareService } from './software.service';
import { TutoriaConcluidaService } from './tutoria-concluida.service';
import { TutoriaEnMarchaService } from './tutoria-en-marcha.service';
import { TrabajoEventosService } from './trabajo-eventos.service';
import { ParticipacionComitesEvService } from './participacion-comites-ev.service';
import { MaterialDidacticoService } from './material-didactico.service';
import { JuradoService } from './jurado.service';
import { ProcesoTecnicaService } from './proceso-tecnica.service';
import { AppConfigService } from '../common/app-config.service';

export interface UserProductivityItem extends BaseProductivityDTO {
  tipo: string; // Tipo de productividad para navegación
  tipoDisplay: string; // Nombre legible del tipo
}

// Interfaz para la respuesta del endpoint de publicaciones del backend
interface PublicacionesBackendResponse {
  usuario_id: number;
  'capitulos de libro': BaseProductivityDTO[];
  'cursos': BaseProductivityDTO[];
  'eventos': BaseProductivityDTO[];
  'jurados': BaseProductivityDTO[];
  'libros': BaseProductivityDTO[];
  'materiales didacticos': BaseProductivityDTO[];
  'noticias': BaseProductivityDTO[];
  'participaciones en comites de evaluacion': BaseProductivityDTO[];
  'procesos o tecnicas': BaseProductivityDTO[];
  'revistas': BaseProductivityDTO[];
  'software': BaseProductivityDTO[];
  'trabajo en eventos': BaseProductivityDTO[];
  'tutorias concluidas': BaseProductivityDTO[];
  'tutorias en marcha': BaseProductivityDTO[];
}

@Injectable({
  providedIn: 'root'
})
export class UserProductivityService {

  // Mapeo de tipos de productividad a nombres legibles
  private tipoDisplayMap: Record<string, string> = {
    'libro': 'Libro',
    'capitulo': 'Capítulo de libro',
    'capitulos': 'Capítulo de libro',
    'curso': 'Curso corto',
    'evento': 'Evento/Seminario',
    'revista': 'Revista',
    'software': 'Software',
    'tutoria_concluida': 'Tutoría concluida',
    'tutoria_en_marcha': 'Tutoría en marcha',
    'trabajo_eventos': 'Trabajo en eventos',
    'participacion_comites': 'Participación en comités',
    'material_didactico': 'Material didáctico',
    'jurado': 'Jurado',
    'proceso_tecnica': 'Proceso o técnica'
  };

  // Mapeo de las claves del backend a los tipos del frontend
  private backendToFrontendTypeMap: Record<string, { tipo: string; tipoDisplay: string }> = {
    'capitulos de libro': { tipo: 'capitulo', tipoDisplay: 'Capítulo de libro' },
    'cursos': { tipo: 'curso', tipoDisplay: 'Curso corto' },
    'eventos': { tipo: 'evento', tipoDisplay: 'Evento/Seminario' },
    'jurados': { tipo: 'jurado', tipoDisplay: 'Jurado' },
    'libros': { tipo: 'libro', tipoDisplay: 'Libro' },
    'materiales didacticos': { tipo: 'material-didactico', tipoDisplay: 'Material didáctico' },
    'noticias': { tipo: 'noticia', tipoDisplay: 'Noticia' },
    'participaciones en comites de evaluacion': { tipo: 'participacion-comites', tipoDisplay: 'Participación en comités' },
    'procesos o tecnicas': { tipo: 'proceso-tecnica', tipoDisplay: 'Proceso o técnica' },
    'revistas': { tipo: 'revista', tipoDisplay: 'Revista' },
    'software': { tipo: 'software', tipoDisplay: 'Software' },
    'trabajo en eventos': { tipo: 'trabajo-eventos', tipoDisplay: 'Trabajo en eventos' },
    'tutorias concluidas': { tipo: 'tutoria-concluida', tipoDisplay: 'Tutoría concluida' },
    'tutorias en marcha': { tipo: 'tutoria-en-marcha', tipoDisplay: 'Tutoría en marcha' }
  };

  constructor(
    private http: HttpClient,
    private config: AppConfigService,
    private booksService: BooksService,
    private capBookService: CapBookService,
    private cursoService: CursoService,
    private eventoService: EventoService,
    private revistaService: RevistaService,
    private softwareService: SoftwareService,
    private tutoriaConcluidaService: TutoriaConcluidaService,
    private tutoriaEnMarchaService: TutoriaEnMarchaService,
    private trabajoEventosService: TrabajoEventosService,
    private participacionComitesEvService: ParticipacionComitesEvService,
    private materialDidacticoService: MaterialDidacticoService,
    private juradoService: JuradoService,
    private procesoTecnicaService: ProcesoTecnicaService
  ) {}

  /**
   * Obtiene todas las publicaciones de un usuario específico usando el endpoint del backend
   * @param userId ID del usuario en la base de datos
   * @returns Observable con lista de publicaciones del usuario
   */
  getProductivityByUserId(userId: number): Observable<UserProductivityItem[]> {
    console.log(`Buscando publicaciones para usuario ID: ${userId} usando endpoint del backend`);
    
    const url = `${this.config.apiUrlBackend}informacion/publicaciones/${userId}/Publicaciones/`;
    console.log(`URL completa: ${url}`);
    
    return this.http.get<PublicacionesBackendResponse>(url).pipe(
      map(response => {
        console.log(`Respuesta completa del backend:`, response);
        const allItems: UserProductivityItem[] = [];
        
        if (!response) {
          console.warn(`Respuesta vacía o inválida del backend para usuario ${userId}`);
          return allItems;
        }
        
        console.log(`Respuesta recibida del backend para usuario ${userId}:`, {
          'capitulos de libro': response['capitulos de libro']?.length || 0,
          'cursos': response['cursos']?.length || 0,
          'eventos': response['eventos']?.length || 0,
          'jurados': response['jurados']?.length || 0,
          'libros': response['libros']?.length || 0,
          'materiales didacticos': response['materiales didacticos']?.length || 0,
          'noticias': response['noticias']?.length || 0,
          'participaciones en comites de evaluacion': response['participaciones en comites de evaluacion']?.length || 0,
          'procesos o tecnicas': response['procesos o tecnicas']?.length || 0,
          'revistas': response['revistas']?.length || 0,
          'software': response['software']?.length || 0,
          'trabajo en eventos': response['trabajo en eventos']?.length || 0,
          'tutorias concluidas': response['tutorias concluidas']?.length || 0,
          'tutorias en marcha': response['tutorias en marcha']?.length || 0
        });

        // Procesar cada tipo de publicación del backend
        Object.keys(this.backendToFrontendTypeMap).forEach(backendKey => {
          const publications = response[backendKey as keyof PublicacionesBackendResponse];
          const typeMapping = this.backendToFrontendTypeMap[backendKey];
          
          if (publications && Array.isArray(publications) && publications.length > 0) {
            console.log(`Procesando ${publications.length} publicaciones de tipo: ${backendKey}`);
            const mappedItems: UserProductivityItem[] = publications.map(item => ({
              ...item,
              tipo: typeMapping.tipo,
              tipoDisplay: typeMapping.tipoDisplay
            }));
            allItems.push(...mappedItems);
          }
        });

        console.log(`Total de publicaciones encontradas para usuario ${userId}: ${allItems.length}`);
        console.log(`Desglose por tipo:`, {
          libros: allItems.filter(i => i.tipo === 'libro').length,
          capitulos: allItems.filter(i => i.tipo === 'capitulo').length,
          cursos: allItems.filter(i => i.tipo === 'curso').length,
          eventos: allItems.filter(i => i.tipo === 'evento').length,
          revistas: allItems.filter(i => i.tipo === 'revista').length,
          software: allItems.filter(i => i.tipo === 'software').length,
          tutoriasConcluidas: allItems.filter(i => i.tipo === 'tutoria-concluida').length,
          tutoriasEnMarcha: allItems.filter(i => i.tipo === 'tutoria-en-marcha').length,
          trabajosEventos: allItems.filter(i => i.tipo === 'trabajo-eventos').length,
          participacionComites: allItems.filter(i => i.tipo === 'participacion-comites').length,
          materialDidactico: allItems.filter(i => i.tipo === 'material-didactico').length,
          jurados: allItems.filter(i => i.tipo === 'jurado').length,
          procesosTecnicas: allItems.filter(i => i.tipo === 'proceso-tecnica').length
        });
        
        return allItems;
      }),
      catchError(error => {
        console.error(`Error al obtener publicaciones del usuario ${userId}:`, error);
        console.error(`Detalles del error:`, {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          error: error.error
        });
        // Retornar array vacío en lugar de lanzar error para que la UI no se rompa
        return of([]);
      })
    );
  }

  /**
   * Obtiene la última publicación de cada tipo de productividad
   * @returns Observable con un objeto que contiene la última publicación de cada tipo
   */
  getLatestPublicationsByType(): Observable<Record<string, UserProductivityItem | null>> {
    console.log('Cargando últimas publicaciones de cada tipo...');
    // Consultar todos los tipos de productividad en paralelo
    return forkJoin({
      libros: this.booksService.getBooks().pipe(catchError((err) => { console.error('Error al obtener libros:', err); return of([]); })),
      capitulos: this.capBookService.getCapBooks().pipe(catchError((err) => { console.error('Error al obtener capítulos:', err); return of([]); })),
      cursos: this.cursoService.getAll().pipe(catchError((err) => { console.error('Error al obtener cursos:', err); return of([]); })),
      eventos: this.eventoService.getAll().pipe(catchError((err) => { console.error('Error al obtener eventos:', err); return of([]); })),
      revistas: this.revistaService.getAll().pipe(catchError((err) => { console.error('Error al obtener revistas:', err); return of([]); })),
      software: this.softwareService.getAll().pipe(catchError((err) => { console.error('Error al obtener software:', err); return of([]); })),
      tutoriasConcluidas: this.tutoriaConcluidaService.getAll().pipe(catchError((err) => { console.error('Error al obtener tutorías concluidas:', err); return of([]); })),
      tutoriasEnMarcha: this.tutoriaEnMarchaService.getAll().pipe(catchError((err) => { console.error('Error al obtener tutorías en marcha:', err); return of([]); })),
      trabajosEventos: this.trabajoEventosService.getAll().pipe(catchError((err) => { console.error('Error al obtener trabajos en eventos:', err); return of([]); })),
      participacionComites: this.participacionComitesEvService.getAll().pipe(catchError((err) => { console.error('Error al obtener participación en comités:', err); return of([]); })),
      materialDidactico: this.materialDidacticoService.getAll().pipe(catchError((err) => { console.error('Error al obtener material didáctico:', err); return of([]); })),
      jurados: this.juradoService.getAll().pipe(catchError((err) => { console.error('Error al obtener jurados:', err); return of([]); })),
      procesosTecnicas: this.procesoTecnicaService.getAll().pipe(catchError((err) => { console.error('Error al obtener procesos o técnicas:', err); return of([]); }))
    }).pipe(
      map(results => {
        console.log('Resultados de forkJoin recibidos:', {
          libros: (results.libros as BaseProductivityDTO[])?.length || 0,
          capitulos: (results.capitulos as BaseProductivityDTO[])?.length || 0,
          cursos: (results.cursos as BaseProductivityDTO[])?.length || 0,
          eventos: (results.eventos as BaseProductivityDTO[])?.length || 0,
          revistas: (results.revistas as BaseProductivityDTO[])?.length || 0,
          software: (results.software as BaseProductivityDTO[])?.length || 0,
          tutoriasConcluidas: (results.tutoriasConcluidas as BaseProductivityDTO[])?.length || 0,
          tutoriasEnMarcha: (results.tutoriasEnMarcha as BaseProductivityDTO[])?.length || 0,
          trabajosEventos: (results.trabajosEventos as BaseProductivityDTO[])?.length || 0,
          participacionComites: (results.participacionComites as BaseProductivityDTO[])?.length || 0,
          materialDidactico: (results.materialDidactico as BaseProductivityDTO[])?.length || 0,
          jurados: (results.jurados as BaseProductivityDTO[])?.length || 0,
          procesosTecnicas: (results.procesosTecnicas as BaseProductivityDTO[])?.length || 0
        });
        
        const latestPublications: Record<string, UserProductivityItem | null> = {};

        // Función auxiliar para obtener la última publicación de un array
        const getLatest = (items: BaseProductivityDTO[], tipo: string, tipoDisplay: string): UserProductivityItem | null => {
          if (!items || items.length === 0) return null;
          // Ordenar por ID descendente (asumiendo que IDs más altos son más recientes)
          const sorted = [...items].sort((a, b) => b.id - a.id);
          const latest = sorted[0];
          return { ...latest, tipo, tipoDisplay };
        };

        // Obtener la última publicación de cada tipo
        latestPublications['libro'] = getLatest(results.libros as BaseProductivityDTO[], 'libro', this.tipoDisplayMap['libro']);
        latestPublications['capitulo'] = getLatest(results.capitulos as BaseProductivityDTO[], 'capitulo', this.tipoDisplayMap['capitulo'] || 'Capítulo de libro');
        latestPublications['curso'] = getLatest(results.cursos as BaseProductivityDTO[], 'curso', this.tipoDisplayMap['curso']);
        latestPublications['evento'] = getLatest(results.eventos as BaseProductivityDTO[], 'evento', this.tipoDisplayMap['evento']);
        latestPublications['revista'] = getLatest(results.revistas as BaseProductivityDTO[], 'revista', this.tipoDisplayMap['revista'] || 'Revista');
        latestPublications['software'] = getLatest(results.software as BaseProductivityDTO[], 'software', this.tipoDisplayMap['software']);
        latestPublications['tutoria_concluida'] = getLatest(results.tutoriasConcluidas as BaseProductivityDTO[], 'tutoria-concluida', this.tipoDisplayMap['tutoria_concluida']);
        latestPublications['tutoria_en_marcha'] = getLatest(results.tutoriasEnMarcha as BaseProductivityDTO[], 'tutoria-en-marcha', this.tipoDisplayMap['tutoria_en_marcha']);
        latestPublications['trabajo_eventos'] = getLatest(results.trabajosEventos as BaseProductivityDTO[], 'trabajo-eventos', this.tipoDisplayMap['trabajo_eventos']);
        latestPublications['participacion_comites'] = getLatest(results.participacionComites as BaseProductivityDTO[], 'participacion-comites', this.tipoDisplayMap['participacion_comites']);
        latestPublications['material_didactico'] = getLatest(results.materialDidactico as BaseProductivityDTO[], 'material-didactico', this.tipoDisplayMap['material_didactico']);
        latestPublications['jurado'] = getLatest(results.jurados as BaseProductivityDTO[], 'jurado', this.tipoDisplayMap['jurado']);
        latestPublications['proceso_tecnica'] = getLatest(results.procesosTecnicas as BaseProductivityDTO[], 'proceso-tecnica', this.tipoDisplayMap['proceso_tecnica']);

        console.log('Últimas publicaciones procesadas:', Object.keys(latestPublications).filter(k => latestPublications[k] !== null).length, 'tipos con publicaciones');
        return latestPublications;
      }),
      catchError(error => {
        console.error('Error en getLatestPublicationsByType:', error);
        return of({});
      })
    );
  }
}

