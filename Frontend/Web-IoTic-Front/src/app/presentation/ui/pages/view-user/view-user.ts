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
  loadingPublications = false;

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
        this.publications = publications;
        this.loadingPublications = false;
        console.log('Publicaciones del usuario:', publications);
      },
      error: (error) => {
        console.error('Error al cargar publicaciones del usuario:', error);
        this.publications = [];
        this.loadingPublications = false;
      }
    });
  }

  /**
   * Manejar click en una publicación
   */
  onPublicationClick(event: { id: number; tipo: string }): void {
    // Navegar a la página de visualización correspondiente
    const routeMap: Record<string, string> = {
      'libro': 'libros',
      'capitulo': 'capitulo_libro',
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
      'proceso_tecnica': 'proceso-tecnica'
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
