import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
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

export interface UserProductivityItem extends BaseProductivityDTO {
  tipo: string; // Tipo de productividad para navegación
  tipoDisplay: string; // Nombre legible del tipo
}

@Injectable({
  providedIn: 'root'
})
export class UserProductivityService {

  // Mapeo de tipos de productividad a nombres legibles
  private tipoDisplayMap: Record<string, string> = {
    'libro': 'Libro',
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

  constructor(
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
   * Obtiene todas las publicaciones de un usuario específico
   * @param userId ID del usuario en la base de datos
   * @returns Observable con lista de publicaciones del usuario
   */
  getProductivityByUserId(userId: number): Observable<UserProductivityItem[]> {
    // Consultar todos los tipos de productividad en paralelo
    return forkJoin({
      libros: this.booksService.getBooks().pipe(catchError(() => of([]))),
      capitulos: this.capBookService.getCapBooks().pipe(catchError(() => of([]))),
      cursos: this.cursoService.getAll().pipe(catchError(() => of([]))),
      eventos: this.eventoService.getAll().pipe(catchError(() => of([]))),
      revistas: this.revistaService.getAll().pipe(catchError(() => of([]))),
      software: this.softwareService.getAll().pipe(catchError(() => of([]))),
      tutoriasConcluidas: this.tutoriaConcluidaService.getAll().pipe(catchError(() => of([]))),
      tutoriasEnMarcha: this.tutoriaEnMarchaService.getAll().pipe(catchError(() => of([]))),
      trabajosEventos: this.trabajoEventosService.getAll().pipe(catchError(() => of([]))),
      participacionComites: this.participacionComitesEvService.getAll().pipe(catchError(() => of([]))),
      materialDidactico: this.materialDidacticoService.getAll().pipe(catchError(() => of([]))),
      jurados: this.juradoService.getAll().pipe(catchError(() => of([]))),
      procesosTecnicas: this.procesoTecnicaService.getAll().pipe(catchError(() => of([])))
    }).pipe(
      map(results => {
        const allItems: UserProductivityItem[] = [];

        // Filtrar y agregar libros
        const libros = (results.libros as BaseProductivityDTO[])
          .filter(item => item.usuario === userId)
          .map(item => ({ ...item, tipo: 'libro', tipoDisplay: this.tipoDisplayMap['libro'] }));
        allItems.push(...libros);

        // Filtrar y agregar capítulos
        const capitulos = (results.capitulos as BaseProductivityDTO[])
          .filter(item => item.usuario === userId)
          .map(item => ({ ...item, tipo: 'capitulo', tipoDisplay: this.tipoDisplayMap['capitulo'] }));
        allItems.push(...capitulos);

        // Filtrar y agregar cursos
        const cursos = (results.cursos as BaseProductivityDTO[])
          .filter(item => item.usuario === userId)
          .map(item => ({ ...item, tipo: 'curso', tipoDisplay: this.tipoDisplayMap['curso'] }));
        allItems.push(...cursos);

        // Filtrar y agregar eventos
        const eventos = (results.eventos as BaseProductivityDTO[])
          .filter(item => item.usuario === userId)
          .map(item => ({ ...item, tipo: 'evento', tipoDisplay: this.tipoDisplayMap['evento'] }));
        allItems.push(...eventos);

        // Filtrar y agregar revistas
        const revistas = (results.revistas as BaseProductivityDTO[])
          .filter(item => item.usuario === userId)
          .map(item => ({ ...item, tipo: 'revista', tipoDisplay: this.tipoDisplayMap['revista'] }));
        allItems.push(...revistas);

        // Filtrar y agregar software
        const software = (results.software as BaseProductivityDTO[])
          .filter(item => item.usuario === userId)
          .map(item => ({ ...item, tipo: 'software', tipoDisplay: this.tipoDisplayMap['software'] }));
        allItems.push(...software);

        // Filtrar y agregar tutorías concluidas
        const tutoriasConcluidas = (results.tutoriasConcluidas as BaseProductivityDTO[])
          .filter(item => item.usuario === userId)
          .map(item => ({ ...item, tipo: 'tutoria-concluida', tipoDisplay: this.tipoDisplayMap['tutoria_concluida'] }));
        allItems.push(...tutoriasConcluidas);

        // Filtrar y agregar tutorías en marcha
        const tutoriasEnMarcha = (results.tutoriasEnMarcha as BaseProductivityDTO[])
          .filter(item => item.usuario === userId)
          .map(item => ({ ...item, tipo: 'tutoria-en-marcha', tipoDisplay: this.tipoDisplayMap['tutoria_en_marcha'] }));
        allItems.push(...tutoriasEnMarcha);

        // Filtrar y agregar trabajos en eventos
        const trabajosEventos = (results.trabajosEventos as BaseProductivityDTO[])
          .filter(item => item.usuario === userId)
          .map(item => ({ ...item, tipo: 'trabajo-eventos', tipoDisplay: this.tipoDisplayMap['trabajo_eventos'] }));
        allItems.push(...trabajosEventos);

        // Filtrar y agregar participación en comités
        const participacionComites = (results.participacionComites as BaseProductivityDTO[])
          .filter(item => item.usuario === userId)
          .map(item => ({ ...item, tipo: 'participacion-comites', tipoDisplay: this.tipoDisplayMap['participacion_comites'] }));
        allItems.push(...participacionComites);

        // Filtrar y agregar material didáctico
        const materialDidactico = (results.materialDidactico as BaseProductivityDTO[])
          .filter(item => item.usuario === userId)
          .map(item => ({ ...item, tipo: 'material-didactico', tipoDisplay: this.tipoDisplayMap['material_didactico'] }));
        allItems.push(...materialDidactico);

        // Filtrar y agregar jurados
        const jurados = (results.jurados as BaseProductivityDTO[])
          .filter(item => item.usuario === userId)
          .map(item => ({ ...item, tipo: 'jurado', tipoDisplay: this.tipoDisplayMap['jurado'] }));
        allItems.push(...jurados);

        // Filtrar y agregar procesos o técnicas
        const procesosTecnicas = (results.procesosTecnicas as BaseProductivityDTO[])
          .filter(item => item.usuario === userId)
          .map(item => ({ ...item, tipo: 'proceso-tecnica', tipoDisplay: this.tipoDisplayMap['proceso_tecnica'] }));
        allItems.push(...procesosTecnicas);

        return allItems;
      })
    );
  }
}

