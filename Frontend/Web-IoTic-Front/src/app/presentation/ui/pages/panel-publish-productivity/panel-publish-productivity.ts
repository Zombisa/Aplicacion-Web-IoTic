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
