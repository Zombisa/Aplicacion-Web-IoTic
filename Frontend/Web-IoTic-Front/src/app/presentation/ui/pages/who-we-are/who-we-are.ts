import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Header } from '../../templates/header/header';
import { ScrollAnimationServices } from '../../../../services/scroll-animation.service';
import { WhoWeAreService } from '../../../../services/who-we-are.service';
import { LoadingService } from '../../../../services/loading.service';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { MisionDTO } from '../../../../models/DTO/MisionDTO';
import { VisionDTO } from '../../../../models/DTO/VisionDTO';
import { HistoriaDTO } from '../../../../models/DTO/HistoriaDTO';
import { ObjetivoDTO } from '../../../../models/DTO/ObjetivoDTO';
import { ValorDTO } from '../../../../models/DTO/ValorDTO';
import { FormsModule } from '@angular/forms';
import emailjs from 'emailjs-com';
@Component({
  selector: 'app-who-we-are',
  imports: [
    CommonModule,
    Header,
    FormsModule,
    LoadingPage
  ],
  templateUrl: './who-we-are.html',
  styleUrl: './who-we-are.css',
})
export class WhoWeAre implements OnInit, AfterViewInit, OnDestroy {
  private observer!: IntersectionObserver;

  // Data from backend
  public mision: MisionDTO | null = null;
  public vision: VisionDTO | null = null;
  public historia: HistoriaDTO | null = null;
  public objetivos: ObjetivoDTO[] = [];
  public valores: ValorDTO[] = [];
  email: string = '';
    message: string = '';
    successMessage: string = '';
    name: string = '';

  objectKeys = Object.keys;

  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private scrollAnimations: ScrollAnimationServices,
    private whoWeAreService: WhoWeAreService,
    public loadingService: LoadingService
  ) {}


  public mensajeInvitacion: string = 'En Help IoTic valoramos profundamente la opinión de nuestros usuarios. Si tienes alguna experiencia que desees compartir, sugerencias para mejorar nuestros servicios, o simplemente quieres hacernos llegar tus comentarios, por favor utiliza el siguiente formulario. Tu aporte es fundamental para seguir creciendo y ofrecerte siempre la mejor atención.'
sendEmail() {
  emailjs.send(
    'iotic',                // Tu Service ID
    'template_7eyusmi',     // Tu Template ID
    {
      name: this.name,      // Coincide con {{name}}
      title: this.message,  // Coincide con {{title}}
      email: this.email     // Coincide con {{email}} en “To Email”
    },
    '-qqk3WNKcqt39owTL'     // Tu Public Key
  ).then(() => {
    this.successMessage = '¡Mensaje enviado!';
    this.email = '';
    this.message = '';
    this.name = '';
  }, () => {
    this.successMessage = 'Error al enviar el mensaje.';
  });
}
  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.scrollAnimations.observeElements(this.elementRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.scrollAnimations.disconnect();
    }
  }

  /**
   * Load all data from backend
   */
  private loadData(): void {
    this.loadingService.show();

    // Load Misión
    this.whoWeAreService.getMision().subscribe({
      next: (data) => {
        if (data && 'id' in data) {
          this.mision = data;
        }
      },
      error: (error) => {
        console.error('Error al cargar misión:', error);
      }
    });

    // Load Visión
    this.whoWeAreService.getVision().subscribe({
      next: (data) => {
        if (data && 'id' in data) {
          this.vision = data;
        }
      },
      error: (error) => {
        console.error('Error al cargar visión:', error);
      }
    });

    // Load Historia
    this.whoWeAreService.getHistoria().subscribe({
      next: (data) => {
        if (data && 'id' in data) {
          this.historia = data;
        }
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al cargar historia:', error);
        this.loadingService.hide();
      }
    });

    // Load Objetivos
    this.whoWeAreService.getObjetivos().subscribe({
      next: (data) => {
        this.objetivos = data || [];
      },
      error: (error) => {
        console.error('Error al cargar objetivos:', error);
      }
    });

    // Load Valores
    this.whoWeAreService.getValores().subscribe({
      next: (data) => {
        this.valores = data || [];
      },
      error: (error) => {
        console.error('Error al cargar valores:', error);
      }
    });
  }


  get options(): any[] {
    const options: any[] = [];

    if (this.mision) {
      options.push({
        title: 'Misión',
        description: this.mision.contenido
      });
    }

    if (this.vision) {
      options.push({
        title: 'Visión',
        description: this.vision.contenido
      });
    }

    if (this.valores.length > 0) {
      const valoresObj: any = {};
      this.valores.forEach(valor => {
        valoresObj[`${valor.titulo}:`] = valor.contenido;
      });
      options.push({
        title: 'Valores',
        description: valoresObj
      });
    }

    return options;
  }

  /**
   * Get history content
   */
  get history(): string {
    return this.historia?.contenido || '';
  }

  /**
   * Get objetivos formatted for display
   */
  get objetivosFormatted(): any[] {
    return this.objetivos.map(obj => ({
      title: obj.titulo,
      description: obj.contenido
    }));
  }

}
