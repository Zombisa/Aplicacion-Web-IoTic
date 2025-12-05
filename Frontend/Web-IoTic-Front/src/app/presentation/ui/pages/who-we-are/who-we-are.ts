import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Header } from '../../templates/header/header';
import { ScrollAnimationServices } from '../../../../services/scroll-animation.service';
import { WhoWeAreService } from '../../../../services/who-we-are.service';
import { AuthService } from '../../../../services/auth.service';
import { LoadingService } from '../../../../services/loading.service';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { FormEditSingleContent } from '../../templates/form-edit-single-content/form-edit-single-content';
import { FormEditMultipleItems, ItemData } from '../../templates/form-edit-multiple-items/form-edit-multiple-items';
import { MisionDTO } from '../../../../models/DTO/MisionDTO';
import { VisionDTO } from '../../../../models/DTO/VisionDTO';
import { HistoriaDTO } from '../../../../models/DTO/HistoriaDTO';
import { ObjetivoDTO } from '../../../../models/DTO/ObjetivoDTO';
import { ValorDTO } from '../../../../models/DTO/ValorDTO';
import { Observable, map, startWith } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-who-we-are',
  imports: [
    CommonModule, 
    Header, 
    LoadingPage,
    FormEditSingleContent,
    FormEditMultipleItems,
    MatIconModule
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

  // Admin state
  isAdmin$!: Observable<boolean>;

  // Edit states
  editingMision: boolean = false;
  editingVision: boolean = false;
  editingHistoria: boolean = false;
  editingObjetivos: boolean = false;
  editingValores: boolean = false;

  // Loading states
  isLoadingMision: boolean = false;
  isLoadingVision: boolean = false;
  isLoadingHistoria: boolean = false;
  isLoadingObjetivos: boolean = false;
  isLoadingValores: boolean = false;

  objectKeys = Object.keys;

  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private scrollAnimations: ScrollAnimationServices,
    private whoWeAreService: WhoWeAreService,
    private authService: AuthService,
    public loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.isAdmin$ = this.authService.isAdmin().pipe(
      startWith(false),
      map(isAdmin => isAdmin)
    );
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

  /**
   * Get options array for display (Misión, Visión, Valores)
   */
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

  // Edit handlers for single content (Misión, Visión, Historia)
  onUpdateMision(contenido: string): void {
    if (!this.mision) return;
    this.isLoadingMision = true;
    this.whoWeAreService.updateMision(this.mision.id, contenido).subscribe({
      next: (data) => {
        this.mision = data;
        this.editingMision = false;
        this.isLoadingMision = false;
      },
      error: (error) => {
        console.error('Error al actualizar misión:', error);
        this.isLoadingMision = false;
      }
    });
  }

  onUpdateVision(contenido: string): void {
    if (!this.vision) return;
    this.isLoadingVision = true;
    this.whoWeAreService.updateVision(this.vision.id, contenido).subscribe({
      next: (data) => {
        this.vision = data;
        this.editingVision = false;
        this.isLoadingVision = false;
      },
      error: (error) => {
        console.error('Error al actualizar visión:', error);
        this.isLoadingVision = false;
      }
    });
  }

  onUpdateHistoria(contenido: string): void {
    if (!this.historia) return;
    this.isLoadingHistoria = true;
    this.whoWeAreService.updateHistoria(this.historia.id, contenido).subscribe({
      next: (data) => {
        this.historia = data;
        this.editingHistoria = false;
        this.isLoadingHistoria = false;
      },
      error: (error) => {
        console.error('Error al actualizar historia:', error);
        this.isLoadingHistoria = false;
      }
    });
  }

  // Edit handlers for multiple items (Objetivos, Valores)
  onObjetivoAdded(item: { titulo: string; contenido: string }): void {
    this.isLoadingObjetivos = true;
    this.whoWeAreService.createObjetivo(item.titulo, item.contenido).subscribe({
      next: (data) => {
        this.objetivos.push(data);
        this.isLoadingObjetivos = false;
        this.loadData(); // Reload to get updated list
      },
      error: (error) => {
        console.error('Error al crear objetivo:', error);
        this.isLoadingObjetivos = false;
      }
    });
  }

  onObjetivoUpdated(item: { id: number; titulo: string; contenido: string }): void {
    this.isLoadingObjetivos = true;
    this.whoWeAreService.updateObjetivo(item.id, item.titulo, item.contenido).subscribe({
      next: (data) => {
        const index = this.objetivos.findIndex(obj => obj.id === data.id);
        if (index !== -1) {
          this.objetivos[index] = data;
        }
        this.isLoadingObjetivos = false;
      },
      error: (error) => {
        console.error('Error al actualizar objetivo:', error);
        this.isLoadingObjetivos = false;
      }
    });
  }

  onObjetivoDeleted(id: number): void {
    this.isLoadingObjetivos = true;
    this.whoWeAreService.deleteObjetivo(id).subscribe({
      next: () => {
        this.objetivos = this.objetivos.filter(obj => obj.id !== id);
        this.isLoadingObjetivos = false;
      },
      error: (error) => {
        console.error('Error al eliminar objetivo:', error);
        this.isLoadingObjetivos = false;
      }
    });
  }

  onValorAdded(item: { titulo: string; contenido: string }): void {
    this.isLoadingValores = true;
    this.whoWeAreService.createValor(item.titulo, item.contenido).subscribe({
      next: (data) => {
        this.valores.push(data);
        this.isLoadingValores = false;
        this.loadData(); // Reload to get updated list
      },
      error: (error) => {
        console.error('Error al crear valor:', error);
        this.isLoadingValores = false;
      }
    });
  }

  onValorUpdated(item: { id: number; titulo: string; contenido: string }): void {
    this.isLoadingValores = true;
    this.whoWeAreService.updateValor(item.id, item.titulo, item.contenido).subscribe({
      next: (data) => {
        const index = this.valores.findIndex(val => val.id === data.id);
        if (index !== -1) {
          this.valores[index] = data;
        }
        this.isLoadingValores = false;
      },
      error: (error) => {
        console.error('Error al actualizar valor:', error);
        this.isLoadingValores = false;
      }
    });
  }

  onValorDeleted(id: number): void {
    this.isLoadingValores = true;
    this.whoWeAreService.deleteValor(id).subscribe({
      next: () => {
        this.valores = this.valores.filter(val => val.id !== id);
        this.isLoadingValores = false;
      },
      error: (error) => {
        console.error('Error al eliminar valor:', error);
        this.isLoadingValores = false;
      }
    });
  }

  // Convert DTOs to ItemData format for the form component
  get objetivosAsItemData(): ItemData[] {
    return this.objetivos.map(obj => ({
      id: obj.id,
      titulo: obj.titulo,
      contenido: obj.contenido
    }));
  }

  get valoresAsItemData(): ItemData[] {
    return this.valores.map(val => ({
      id: val.id,
      titulo: val.titulo,
      contenido: val.contenido
    }));
  }
}