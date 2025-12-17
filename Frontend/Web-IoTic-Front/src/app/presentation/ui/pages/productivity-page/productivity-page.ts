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
    { key: 'libros', title: 'Libros publicados', route: '/productividad/lista/libros', image:'https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg' },
    { key: 'capitulos', title: 'Capítulos de libros', route: '/productividad/lista/capitulos', image: 'https://images.pexels.com/photos/831430/pexels-photo-831430.jpeg' },
    { key: 'eventos', title: 'Trabajos en eventos', route: '/productividad/lista/eventos', image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg' },
    { key: 'revistas', title: 'Revistas', route: '/productividad/lista/revistas', image: 'https://www.itm.edu.co//wp-content/uploads/noticias/revista-Indexadas-ITM.jpg' },
    { key: 'software', title: 'Software', route: '/productividad/lista/software', image: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg' },
    { key: 'cursos', title: 'Cursos de duración corta', route: '/productividad/lista/cursos', image: 'https://images.pexels.com/photos/5912280/pexels-photo-5912280.jpeg'},
    { key: 'organizacion', title: 'Organización de eventos', route: '/productividad/lista/organizacion', image: 'https://www.unicauca.edu.co/wp-content/uploads/2025/08/Unicauca-sede-de-Colombia-4.0-1.jpeg' },
    { key: 'comites', title: 'Participación en comités de evaluación', route: '/productividad/lista/comites', image: 'https://images.pexels.com/photos/7693692/pexels-photo-7693692.jpeg' },
    { key: 'material', title: 'Desarrollo de material didáctico', route: '/productividad/lista/material', imgae:"https://images.pexels.com/photos/1181573/pexels-photo-1181573.jpeg" },
    { key: 'jurado', title: 'Jurado - Comisiones evaluadoras ', route: '/productividad/lista/jurado', image: 'https://www.nuevaliada.cl/wp-content/uploads/2021/08/Que%CC%81-es-una-tesis-y-co%CC%81mo-hacerla.png'},
    { key: 'procesos', title: 'Procesos o técnicas', route: '/productividad/lista/procesos', image: 'https://images.pexels.com/photos/4144097/pexels-photo-4144097.jpeg'},
    { key: 'tutorias-concluidas', title: 'Trabajos dirigidos - Tutorías concluidas', route: '/productividad/lista/tutorias_concluidas', images: "https://images.pexels.com/photos/3321791/pexels-photo-3321791.jpeg" },
    { key: 'tutorias-en-marcha', title: 'Trabajos dirigidos - Tutorías en marcha', route: '/productividad/lista/tutorias_en_marcha', Image: 'https://www.unicauca.edu.co/wp-content/uploads/elementor/thumbs/WhatsApp-Image-2025-08-26-at-9.48.46-AM-ratwxe52uo9636x3frf1fq06y3yn8wob8v2d8w5ixk-rcmhqy2cw0f477d2v9dnog1lnf391ba4dhp8hblou8.jpeg' },
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
