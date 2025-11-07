import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';
import { Header } from '../../templates/header/header';

@Component({
  selector: 'app-who-we-are',
  imports: [CommonModule, Header],
  templateUrl: './who-we-are.html',
  styleUrl: './who-we-are.css'
})
export class WhoWeAre implements AfterViewInit{
constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
    public textCarrousel: string[] = [
    '¡Bienvenido! Únete a nuestra comunidad y accede a experiencias exclusivas. Regístrate ahora y da el primer paso hacia nuevas oportunidades.',
    'Desde el año 20W0 un grupo de profesores del Departamento de Sistemas de la Universidad del Cauca asignados al naciente Programa de Ingeniería de Sistemas, unieron sus intereses para conformar lo que ahora es el Grupo de tecnologías de la Información',
  ];
  public titleCarrousel: string[] = [
    'VISION',
    'MISION',
  ];
  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Agregar un pequeño delay para asegurar que el DOM esté completamente renderizado
      setTimeout(() => {
        const carouselElement = document.getElementById('WhoAreCarousel');
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
