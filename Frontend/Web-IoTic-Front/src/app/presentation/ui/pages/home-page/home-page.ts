import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Header } from '../../templates/header/header';
declare var bootstrap: any;

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, Header],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage implements AfterViewInit{
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
    public mensajes: string[] = [
    '¡Bienvenido! Únete a nuestra comunidad y accede a experiencias exclusivas. Regístrate ahora y da el primer paso hacia nuevas oportunidades.',
    'Desde el año 2000 un grupo de profesores del Departamento de Sistemas de la Universidad del Cauca asignados al naciente Programa de Ingeniería de Sistemas, unieron sus intereses para conformar lo que ahora es el Grupo de tecnologías de la Información',
    'GTI. Hoy en día el grupo está conformado por más de 20 profesores de la Universidad del Cauca, especialmente del Departamento de Sistemas. Además se cuenta con un grupo de más de 30 estudiantes de pregrado realizando sus Proyectos de Grado enmarcados en los proyectos de investigación',
    'Descubre nuestros proyectos y publicaciones',
    'Juntos generamos conocimiento y cambio'
  ];
     ngAfterViewInit() {
  if (isPlatformBrowser(this.platformId)) {
    // Agregar un pequeño delay para asegurar que el DOM esté completamente renderizado
    setTimeout(() => {
      const carouselElement = document.getElementById('welcomeCarousel');
      if (carouselElement) {
        // Verificar si Bootstrap está disponible
        if (typeof (window as any).bootstrap !== 'undefined') {
          const bootstrap = (window as any).bootstrap;
          new bootstrap.Carousel(carouselElement, {
            interval: 3000, // Cambiar a 3 segundos (1 segundo es muy rápido)
            ride: 'carousel',
            wrap: true,
            keyboard: true,
            pause: 'hover'
          });
        } else {
          console.warn('Bootstrap JS no está disponible');
        }
      }
    }, 10);
  }
}
}
