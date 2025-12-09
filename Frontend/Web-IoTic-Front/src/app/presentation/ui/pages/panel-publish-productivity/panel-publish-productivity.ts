import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Header } from '../../templates/header/header';

import { LoadingPage } from '../../components/loading-page/loading-page';
import { LoadingService } from '../../../../services/loading.service';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-panel-publish-productivity',
  imports: [CommonModule, Header, LoadingPage],
  templateUrl: './panel-publish-productivity.html',
  styleUrl: './panel-publish-productivity.css'
})
export class PanelPublishProductivity {

  /**
   * Tipos de productividad disponibles para publicar
   * cada tipo tiene un nombre, un identificador (tipo) y una descripcion
   * el identificador (tipo) se usa para navegar al formulario correspondiente
   * la descripcion se muestra en la tarjeta de cada tipo
   * @example
   * { name: TITULO_EN_LA_PAGINA, tipo: CLAVE_PARA_URL, description: DESCRIPCION_DEL_TOP }
   * 
   */
  types = [
    { name: 'Libro', tipo: 'libro',description: 'En esta seccion podras publicar libros.', },
    { name: 'Capítulo de Libro', tipo: 'capitulo_libro',description: 'En esta seccion podras publicar capitulos de libros.', },
    { name: 'Participación en Comités de Evaluación', tipo: 'participacion_comites_ev', description: 'Publica tus participaciones en comités o eventos de evaluación académica o profesional.' },
    { name: 'Procesos o Técnicas', tipo: 'proceso_tecnica', description: 'Comparte procesos o técnicas desarrolladas en tu ámbito profesional o académico.' },
    { name: 'Revistas', tipo: 'revista', description: 'Publica información sobre revistas académicas o profesionales en las que has participado.' },
    { name: 'Software', tipo: 'software', description: 'Comparte software desarrollado, incluyendo herramientas, aplicaciones o sistemas.' },
    { name: 'Trabajos en Eventos', tipo: 'trabajo_eventos', description: 'Publica trabajos presentados en eventos académicos, conferencias o simposios.' },
    { name: 'Trabajos Dirigidos - Tutorías en Marcha', tipo: 'tutoria_en_marcha', description: 'Registra tutorías que actualmente están en desarrollo o ejecución.'},
    { name: 'Trabajos Dirigidos - Tutorías Concluidas', tipo: 'tutoria_concluida', description: 'Publica tutorías finalizadas indicando los resultados o logros alcanzados.'},
    { name: 'Cursos de Duración Corta', tipo: 'curso', description: 'Publica cursos de duración corta que has impartido o desarrollado.'},
    { name: 'Desarrollo de Material Didáctico', tipo: 'material_didactico', description: 'Comparte materiales didácticos que has desarrollado para la enseñanza.'},
    { name: 'Jurado - Comisiones Evaluadoras', tipo: 'jurado', description: 'Registra tu participación como jurado en comisiones evaluadoras de trabajo de grado.'},
    { name: 'Organización de Eventos', tipo: 'evento', description: 'Publica eventos académicos o profesionales que has organizado.'}
  ];


  constructor(
    
    private router: Router,
    public loadingService: LoadingService
  ) {}

  /**
   * 
   * @param tipo tipo de productividad a publicar
   * Navega al formulario correspondiente segun el tipo de productividad
   */
  gotoForm(tipo: string): void {
    this.router.navigate(['/productividad/panel/formulario', tipo]);
  }

}
