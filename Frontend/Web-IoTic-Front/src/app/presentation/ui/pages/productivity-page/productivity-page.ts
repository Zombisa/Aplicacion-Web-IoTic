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
    { key: 'libros', title: 'Libros publicados', route: '/productividad/lista/libros', image:'https://i.blogs.es/b7cc06/libros/1366_2000.jpg' },
    { key: 'capitulos', title: 'Capítulos de libros', route: '/productividad/lista/capitulos', image: 'https://cdn.pixabay.com/photo/2015/09/09/20/22/book-933088_1280.jpg' },
    { key: 'eventos', title: 'Trabajos en eventos', route: '/publicaciones/eventos', image: 'https://cevents.es/wp-content/uploads/2021/11/evento-corporativo-imgpost.jpg' },
    { key: 'revistas', title: 'Revistas', route: '/productividad/lista/revistas', image: 'https://www.itm.edu.co//wp-content/uploads/noticias/revista-Indexadas-ITM.jpg' },
    { key: 'software', title: 'Software', route: '/productividad/lista/software', image: 'https://starkcloud.com/wp-content/uploads/2024/12/La-tecnologia-del-futuro-5-avances-que-cambiaran-el-mundo-2000x1200-1.jpg' },
    { key: 'cursos', title: 'Cursos de duración corta', route: '/productividad/lista/cursos', image: 'https://d3puay5pkxu9s4.cloudfront.net/curso/4296/800_imagen.jpg'},
    { key: 'organizacion', title: 'Organización de eventos', route: '/publicaciones/organizacion', image: 'https://www.unicauca.edu.co/wp-content/uploads/2025/08/Unicauca-sede-de-Colombia-4.0-1.jpeg' },
    { key: 'comites', title: 'Participación en comités de evaluación', route: '/publicaciones/comites', image: 'https://13f177ac6e.cbaul-cdnwnd.com/88c0b6cd8d8017f6daf8f06193ac0945/200000099-e9fbbebfd7/RPP.jpg' },
    { key: 'material', title: 'Desarrollo de material didáctico', route: '/publicaciones/material', imgae:"https://lisit.cl/wp-content/uploads/2023/12/pruebas-de-software.png" },
    { key: 'jurado', title: 'Jurado - Comisiones evaluadoras ', route: '/publicaciones/jurado', image: 'https://www.nuevaliada.cl/wp-content/uploads/2021/08/Que%CC%81-es-una-tesis-y-co%CC%81mo-hacerla.png'},
    { key: 'procesos', title: 'Procesos o técnicas', route: '/publicaciones/procesos' },
    { key: 'tutorias-concluidas', title: 'Trabajos dirigidos - Tutorías concluidas', route: '/productividad/lista/tutorias_concluidas', images: "https://www.entornoturistico.com/wp-content/uploads/2022/06/Exposicio%CC%81n-de-tesis-ante-sinodales.jpg" },
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
