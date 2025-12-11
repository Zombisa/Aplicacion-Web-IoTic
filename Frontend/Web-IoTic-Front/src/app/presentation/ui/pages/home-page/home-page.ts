import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { ScrollAnimationServices } from '../../../../services/scroll-animation.service';
import { UserProductivityService, UserProductivityItem } from '../../../../services/information/user-productivity.service';
import { LoadingService } from '../../../../services/loading.service';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { RegistroFotograficoDTO } from '../../../../models/DTO/RegistroFotograficoDTO';
import { RegistroFotograficoService } from '../../../../services/registro-fotografico.service';
import { interval, Subscription } from 'rxjs';
declare var bootstrap: any;

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, Header, LoadingPage],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {

  private observer!: IntersectionObserver;
  private heroPhotoSubscription?: Subscription;
  public currentHeroIndex: number = 0;
  public latestPublications: Record<string, UserProductivityItem | null> = {};
  public publicationTypes: Array<{ key: string, label: string }> = [
    { key: 'libro', label: 'Libro' },
    { key: 'capitulo', label: 'Capítulo de libro' },
    { key: 'curso', label: 'Curso corto' },
    { key: 'evento', label: 'Evento/Seminario' },
    { key: 'revista', label: 'Revista' },
    { key: 'software', label: 'Software' },
    { key: 'tutoria_concluida', label: 'Tutoría concluida' },
    { key: 'tutoria_en_marcha', label: 'Tutoría en marcha' },
    { key: 'trabajo_eventos', label: 'Trabajo en eventos' },
    { key: 'participacion_comites', label: 'Participación en comités' },
    { key: 'material_didactico', label: 'Material didáctico' },
    { key: 'jurado', label: 'Jurado' },
    { key: 'proceso_tecnica', label: 'Proceso o técnica' }
  ];
  public registrosFotograficosHome: RegistroFotograficoDTO[] = [];
  public registrosFotograficosSlides: RegistroFotograficoDTO[][] = [];
  public heroFotos: RegistroFotograficoDTO[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private scrollAnimations: ScrollAnimationServices,
    private elementRef: ElementRef,
    private userProductivityService: UserProductivityService,
    public loadingService: LoadingService,
    private router: Router,
    private registroFotograficoService: RegistroFotograficoService
  ) { }

  public mensajes: string[] = [
    '¡Bienvenido! Únete a nuestra comunidad y accede a experiencias exclusivas. Regístrate ahora y da el primer paso hacia nuevas oportunidades.',
    'Desde el año 2000 un grupo de profesores del Departamento de Sistemas de la Universidad del Cauca asignados al naciente Programa de Ingeniería de Sistemas, unieron sus intereses para conformar lo que ahora es el Grupo de tecnologías de la Información',
    'GTI. Hoy en día el grupo está conformado por más de 20 profesores de la Universidad del Cauca, especialmente del Departamento de Sistemas. Además se cuenta con un grupo de más de 30 estudiantes de pregrado realizando sus Proyectos de Grado enmarcados en los proyectos de investigación',
    'Descubre nuestros proyectos y publicaciones',
    'Juntos generamos conocimiento y cambio'
  ];

  ngOnInit(): void {
    this.loadLatestPublications();
    this.loadRegistroFotograficoHome();
  }

  /**
   * Carga las últimas publicaciones de cada tipo
   */
  loadLatestPublications(): void {
    this.loadingService.show();
    this.userProductivityService.getLatestPublicationsByType().subscribe({
      next: (publications) => {
        this.latestPublications = publications;
        this.loadingService.hide();
        console.log('Últimas publicaciones cargadas:', publications);
      },
      error: (error) => {
        console.error('Error al cargar últimas publicaciones:', error);
        this.loadingService.hide();
      }
    });
  }

  /**
 * Carga algunos registros fotográficos para el carrusel del home
 */
  loadRegistroFotograficoHome(): void {
  this.registroFotograficoService.getAll().subscribe({
    next: (registros) => {
      console.log('Registros fotográficos cargados:', registros);
      
      // Puedes limitar cuántas fotos muestras en el home
      this.registrosFotograficosHome = registros;

      // Tomar las últimas 5 fotos (ordenadas por id desc) para el banner principal
      const ordenadas = [...registros].sort((a, b) => (b.id || 0) - (a.id || 0));
      this.heroFotos = ordenadas.slice(0, 5);
      console.log('Hero fotos:', this.heroFotos);
      console.log('Primera foto:', this.heroFotos[0]);

      // Iniciar el cambio aleatorio de fotos cada 4 segundos
      this.startHeroPhotoRotation();

      // Agrupar en slides de 3
      this.registrosFotograficosSlides = [];
      const chunkSize = 3;
      for (let i = 0; i < this.registrosFotograficosHome.length; i += chunkSize) {
        this.registrosFotograficosSlides.push(
          this.registrosFotograficosHome.slice(i, i + chunkSize)
        );
      }

      // Inicializar carrusel de Bootstrap
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          const el = document.getElementById('registroFotograficoCarousel');
          if (el && typeof (window as any).bootstrap !== 'undefined') {
            const bootstrap = (window as any).bootstrap;
            new bootstrap.Carousel(el, {
              interval: 5000,
              ride: 'carousel',
              wrap: true,
              keyboard: true,
              pause: 'hover'
            });
          }
        }, 50);
      }
    },
    error: (err) => {
      console.error('Error al cargar registros fotográficos para el home:', err);
    }
  });
}

  /**
   * Obtiene las publicaciones que tienen datos (no null)
   */
  getAvailablePublications(): Array<{ key: string, label: string, publication: UserProductivityItem }> {
    return this.publicationTypes
      .filter(type => this.latestPublications[type.key] !== null)
      .map(type => ({
        key: type.key,
        label: type.label,
        publication: this.latestPublications[type.key]!
      }));
  }

  /**
   * Navega a la página de visualización de una publicación
   */
  navigateToPublication(tipo: string, id: number): void {
    const routeMap: Record<string, string> = {
      'libro': 'libros',
      'capitulo': 'capitulos',
      'curso': 'cursos',
      'evento': 'eventos',
      'revista': 'revistas',
      'software': 'software',
      'tutoria-concluida': 'tutorias_concluidas',
      'tutoria-en-marcha': 'tutorias_en_marcha',
      'trabajo-eventos': 'trabajo-eventos',
      'participacion-comites': 'participacion-comites',
      'material-didactico': 'material-didactico', // Si no existe ruta, redirigir a lista
      'jurado': 'jurado',
      'proceso-tecnica': 'procesos'
    };

    const route = routeMap[tipo];
    if (route) {
      this.router.navigate([`/productividad/${route}`, id]);
    } else {
      // Si no hay ruta específica, redirigir a la lista de ese tipo
      console.warn(`No hay ruta específica para el tipo: ${tipo}, redirigiendo a lista`);
      this.router.navigate([`/productividad/lista/${tipo}`]);
    }
  }

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
    if (isPlatformBrowser(this.platformId)) {
      this.scrollAnimations.observeElements(this.elementRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.scrollAnimations.disconnect();
    }
    if (this.heroPhotoSubscription) {
      this.heroPhotoSubscription.unsubscribe();
    }
  }

  /**
   * Inicia la rotación aleatoria de fotos del hero cada 4 segundos
   */
  startHeroPhotoRotation(): void {
    if (!isPlatformBrowser(this.platformId) || this.heroFotos.length <= 1) {
      return;
    }

    this.heroPhotoSubscription = interval(8000).subscribe(() => {
      // Generar un índice aleatorio diferente al actual
      let newIndex: number;
      do {
        newIndex = Math.floor(Math.random() * Math.min(5, this.heroFotos.length));
      } while (newIndex === this.currentHeroIndex && this.heroFotos.length > 1);
      
      this.currentHeroIndex = newIndex;
    });
  }

  goToRegistroFotografico(): void {
    this.router.navigate(['/registro-fotografico']);
  }
}
