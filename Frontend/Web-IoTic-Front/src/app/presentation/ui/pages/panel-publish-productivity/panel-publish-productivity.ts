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

  types = [
    { name: 'Libro', tipo: 'book',description: 'En esta seccion podras publicar libros.', },
    { name: 'Capítulo de Libro', tipo: 'cap_book',description: 'En esta seccion podras publicar capitulos de libros.', },
  ];


  constructor(
    
    private router: Router,
    public loadingService: LoadingService
  ) {}

  gotoForm(tipo: string): void {
    this.router.navigate(['/productividad/panel/formulario', tipo]);
  }

}
