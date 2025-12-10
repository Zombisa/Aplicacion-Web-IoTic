import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { title } from 'process';
import { Header } from '../../templates/header/header';
import { Router, RouterModule } from '@angular/router';
import { ScrollAnimationServices } from '../../../../services/scroll-animation.service';

@Component({
  selector: 'app-productivity-page',
  imports: [CommonModule, RouterModule, Header],
  templateUrl: './productivity-page.html',
  styleUrl: './productivity-page.css'
})
export class ProductivityPage implements AfterViewInit, OnDestroy{
  private observer!: IntersectionObserver;

  /** Rutas  */
  public routesBox = [
    { key: 'libros', title: 'Libros publicados', route: '/productividad/lista/libros' },
    { key: 'capitulos', title: 'Capítulos de libros', route: '/productividad/lista/capitulos' },
    { key: 'eventos', title: 'Trabajos en eventos', route: '/publicaciones/eventos' },
    { key: 'revistas', title: 'Revistas', route: '/productividad/lista/revistas' },
    { key: 'software', title: 'Software', route: '/productividad/lista/software' },
    { key: 'cursos', title: 'Cursos de duración corta', route: '/productividad/lista/cursos' },
    { key: 'organizacion', title: 'Organización de eventos', route: '/publicaciones/organizacion' },
    { key: 'comites', title: 'Participación en comités de evaluación', route: '/publicaciones/comites' },
    { key: 'material', title: 'Desarrollo de material didáctico', route: '/publicaciones/material' },
    { key: 'jurado', title: 'Jurado - Comisiones evaluadoras de trabajo de grado', route: '/publicaciones/jurado' },
    { key: 'procesos', title: 'Procesos o técnicas', route: '/publicaciones/procesos' },
    { key: 'tutorias-concluidas', title: 'Trabajos dirigidos - Tutorías concluidas', route: '/productividad/lista/tutorias_concluidas' },
    { key: 'tutorias-en-marcha', title: 'Trabajos dirigidos - Tutorías en marcha', route: '/productividad/lista/tutorias_en_marcha' },
  ];

  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private scrollAnimations: ScrollAnimationServices,
    private route: Router,
  ) {}
  
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.scrollAnimations.observeElements(this.elementRef.nativeElement);
      }, 100);
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.scrollAnimations.disconnect();
    }
  }
  goTo(tipo: string) {
    this.route.navigate(['/productividad', tipo]);
  }
}
