import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../templates/header/header';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../../services/users.service';
import { UserDTO } from '../../../../models/DTO/UserDTO';
import { LoadingService } from '../../../../services/loading.service';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { SectionInfoUser } from '../../templates/section-info-user/section-info-user';
import { ConfirmationModal } from '../../templates/confirmation-modal/confirmation-modal';
import { PublicationsList } from '../../templates/publications-list/publications-list';
import { UserProductivityService, UserProductivityItem } from '../../../../services/information/user-productivity.service';

interface PublicationsByType {
  tipo: string;
  tipoDisplay: string;
  publications: UserProductivityItem[];
}

@Component({
  selector: 'app-view-user',
  standalone: true,
  imports: [CommonModule, Header, LoadingPage, SectionInfoUser, ConfirmationModal, PublicationsList],
  templateUrl: './view-user.html',
  styleUrls: ['./view-user.css']
})
export class ViewUser implements OnInit {
  userId!: number;
  user?: UserDTO;
  showDeleteModal = false;
  showError = false;
  errorMessage = '';
  publications: UserProductivityItem[] = [];
  publicationsByType: PublicationsByType[] = [];
  loadingPublications = false;
  
  // Orden de los tipos de productividad para mostrar
  private readonly typeOrder: string[] = [
    'libro',
    'capitulo',
    'revista',
    'curso',
    'evento',
    'software',
    'tutoria-concluida',
    'tutoria-en-marcha',
    'trabajo-eventos',
    'participacion-comites',
    'material-didactico',
    'jurado',
    'proceso-tecnica'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    public loadingService: LoadingService,
    private userProductivityService: UserProductivityService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.userId = Number(idParam);
        this.getUserById();
      } else {
        this.showError = true;
        this.errorMessage = 'ID de usuario no proporcionado en la URL.';
      }
    });
  }

  /**
   * Obtener el usuario por ID
   */
  getUserById(): void {
    this.loadingService.show();
    // Intentar obtener del endpoint específico, si falla, obtener de la lista
    this.usersService.getUsers().subscribe({
      next: (users) => {
        const foundUser = users.find(u => u.id === this.userId);
        if (foundUser) {
          this.user = foundUser;
          this.loadingService.hide();
          // Cargar publicaciones del usuario
          this.loadUserPublications();
        } else {
          this.showError = true;
          this.errorMessage = 'Usuario no encontrado.';
          this.loadingService.hide();
        }
      },
      error: (error) => {
        console.error('Error al obtener el usuario:', error);
        this.showError = true;
        this.errorMessage = 'Error al cargar la información del usuario.';
        this.loadingService.hide();
      }
    });
  }

  /**
   * Cargar publicaciones del usuario
   */
  loadUserPublications(): void {
    if (!this.userId) return;
    
    this.loadingPublications = true;
    this.userProductivityService.getProductivityByUserId(this.userId).subscribe({
      next: (publications) => {
        console.log('Publicaciones recibidas del servicio:', publications);
        console.log('Cantidad total:', publications.length);
        
        // Validar que las publicaciones tengan el campo tipo
        const validPublications = publications.filter(pub => {
          if (!pub.tipo) {
            console.warn('Publicación sin tipo encontrada:', pub);
            return false;
          }
          return true;
        });
        
        if (validPublications.length !== publications.length) {
          console.warn(`${publications.length - validPublications.length} publicaciones fueron filtradas por falta de tipo`);
        }
        
        this.publications = validPublications;
        this.groupPublicationsByType();
        this.loadingPublications = false;
      },
      error: (error) => {
        console.error('Error al cargar publicaciones del usuario:', error);
        this.publications = [];
        this.publicationsByType = [];
        this.loadingPublications = false;
      }
    });
  }

  /**
   * Agrupa las publicaciones por tipo de productividad
   */
  groupPublicationsByType(): void {
    console.log('Iniciando agrupación de publicaciones. Total:', this.publications.length);
    
    // Limpiar array anterior
    this.publicationsByType = [];
    
    if (!this.publications || this.publications.length === 0) {
      console.log('No hay publicaciones para agrupar');
      return;
    }
    
    const grouped = new Map<string, UserProductivityItem[]>();
    
    // Agrupar publicaciones por tipo
    this.publications.forEach((publication, index) => {
      const tipo = publication.tipo;
      const tipoDisplay = publication.tipoDisplay || tipo;
      
      // Log para debugging
      if (index < 5) { // Solo log de las primeras 5 para no saturar
        console.log(`Publicación ${index + 1}: tipo="${tipo}", tipoDisplay="${tipoDisplay}", titulo="${publication.titulo}"`);
      }
      
      if (!tipo) {
        console.warn('Publicación sin tipo:', publication);
        return;
      }
      
      if (!grouped.has(tipo)) {
        grouped.set(tipo, []);
      }
      grouped.get(tipo)!.push(publication);
    });
    
    console.log('Tipos encontrados después de agrupar:', Array.from(grouped.keys()));
    console.log('Cantidad por tipo:', Array.from(grouped.entries()).map(([tipo, pubs]) => `${tipo}: ${pubs.length}`));
    
    // Mapeo de tipos a nombres legibles (por si falta tipoDisplay)
    const tipoDisplayMap: Record<string, string> = {
      'libro': 'Libro',
      'capitulo': 'Capítulo de libro',
      'revista': 'Revista',
      'curso': 'Curso corto',
      'evento': 'Evento/Seminario',
      'software': 'Software',
      'tutoria-concluida': 'Tutoría concluida',
      'tutoria-en-marcha': 'Tutoría en marcha',
      'trabajo-eventos': 'Trabajo en eventos',
      'participacion-comites': 'Participación en comités',
      'material-didactico': 'Material didáctico',
      'jurado': 'Jurado',
      'proceso-tecnica': 'Proceso o técnica'
    };
    
    // Convertir a array y ordenar según el orden definido
    this.publicationsByType = this.typeOrder
      .map(tipo => {
        const publications = grouped.get(tipo);
        if (publications && publications.length > 0) {
          const firstPub = publications[0];
          return {
            tipo,
            tipoDisplay: firstPub.tipoDisplay || tipoDisplayMap[tipo] || tipo,
            publications: [...publications] // Crear copia del array
          };
        }
        return null;
      })
      .filter((item): item is PublicationsByType => item !== null);
    
    // Agregar tipos que no están en el orden definido (por si acaso)
    grouped.forEach((publications, tipo) => {
      if (!this.typeOrder.includes(tipo)) {
        console.warn(`Tipo no esperado encontrado: ${tipo}, agregándolo al final`);
        const firstPub = publications[0];
        this.publicationsByType.push({
          tipo,
          tipoDisplay: firstPub.tipoDisplay || tipoDisplayMap[tipo] || tipo,
          publications: [...publications]
        });
      }
    });
    
    // Ordenar las publicaciones dentro de cada sección (opcional: por fecha o ID)
    this.publicationsByType.forEach(section => {
      section.publications.sort((a, b) => {
        // Ordenar por ID descendente (más recientes primero)
        return (b.id || 0) - (a.id || 0);
      });
    });
    
    console.log(`Publicaciones agrupadas en ${this.publicationsByType.length} secciones:`, 
      this.publicationsByType.map(s => `${s.tipoDisplay} (${s.publications.length})`));
  }

  /**
   * TrackBy function para mejorar el rendimiento del *ngFor
   */
  trackBySection(index: number, section: PublicationsByType): string {
    return section.tipo;
  }

  /**
   * Manejar click en una publicación
   */
  onPublicationClick(event: { id: number; tipo: string }): void {
    // Navegar a la página de visualización correspondiente
    const routeMap: Record<string, string> = {
      'libro': 'libros',
      'capitulo': 'capitulos',
      'curso': 'curso',
      'evento': 'trabajo_evento',
      'revista': 'revista',
      'software': 'software',
      'tutoria_concluida': 'tutoria-concluida',
      'tutoria_en_marcha': 'tutoria-en-marcha',
      'trabajo_eventos': 'trabajo-eventos',
      'participacion_comites_ev': 'participacion_comites_ev',
      'material_didactico': 'material-didactico',
      'jurado': 'jurado',
      'proceso_tecnica': 'proceso_tecnica'
    };

    const route = routeMap[event.tipo] || event.tipo;
    if (route && event.id) {
      this.router.navigate(['/productividad', route, event.id]);
    }
  }

  /**
   * Manejar eventos del componente section-info-user
   */
  handlerFunctionEmitter(action: string): void {
    switch (action) {
      case 'edit':
        this.goToEdit();
        break;
      case 'delete':
        this.confirmDelete();
        break;
      default:
        console.warn('Acción no reconocida:', action);
    }
  }

  /**
   * Navegar a la página de edición del usuario
   */
  goToEdit(): void {
    this.router.navigate(['/usuarios/edit', this.userId]);
  }

  /**
   * Mostrar modal de confirmación para eliminar usuario
   */
  confirmDelete(): void {
    this.showDeleteModal = true;
  }

  /**
   * Ejecutar eliminación del usuario tras confirmación
   */
  onDeleteConfirmed(): void {
    if (!this.user?.id) return;

    this.loadingService.show();
    this.usersService.deleteUser(this.user.id).subscribe({
      next: () => {
        console.log('Usuario eliminado exitosamente');
        this.loadingService.hide();
        this.router.navigate(['/usuarios']);
      },
      error: (error) => {
        console.error('Error al eliminar el usuario:', error);
        this.loadingService.hide();
        this.showError = true;
        this.errorMessage = 'Error al eliminar el usuario. Por favor, intente nuevamente.';
      }
    });
  }

  /**
   * Cancelar eliminación del usuario
   */
  onDeleteCancelled(): void {
    this.showDeleteModal = false;
  }
}
