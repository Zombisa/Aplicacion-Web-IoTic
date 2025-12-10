import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../templates/header/header';
import { Router } from '@angular/router';
import { UsersService } from '../../../../services/users.service';
import { UserDTO } from '../../../../models/DTO/UserDTO';
import { LoadingService } from '../../../../services/loading.service';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { SectionInfoUser } from '../../templates/section-info-user/section-info-user';
import { PublicationsList } from '../../templates/publications-list/publications-list';
import { UserProductivityService, UserProductivityItem } from '../../../../services/information/user-productivity.service';
import { AuthService } from '../../../../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, Header, LoadingPage, SectionInfoUser, PublicationsList],
  templateUrl: './my-profile.html',
  styleUrls: ['./my-profile.css']
})
export class MyProfile implements OnInit {
  user?: UserDTO;
  showError = false;
  errorMessage = '';
  publications: UserProductivityItem[] = [];
  loadingPublications = false;

  constructor(
    private router: Router,
    private usersService: UsersService,
    public loadingService: LoadingService,
    private userProductivityService: UserProductivityService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  /**
   * Cargar el usuario actual
   */
  async loadCurrentUser(): Promise<void> {
    try {
      this.loadingService.show();
      
      // Obtener el usuario de Firebase
      const firebaseUser = await firstValueFrom(
        this.authService.currentUser.pipe(
          // Esperar hasta que haya un usuario o null
        )
      );

      if (!firebaseUser || !firebaseUser.email) {
        this.showError = true;
        this.errorMessage = 'No se pudo obtener la información del usuario autenticado.';
        this.loadingService.hide();
        return;
      }

      // Obtener el usuario de la base de datos usando el email
      this.usersService.getCurrentUserByEmail(firebaseUser.email).subscribe({
        next: (user) => {
          if (user) {
            this.user = user;
            this.loadingService.hide();
            // Cargar publicaciones del usuario
            this.loadUserPublications();
          } else {
            this.showError = true;
            this.errorMessage = 'Usuario no encontrado en la base de datos.';
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
    } catch (error) {
      console.error('Error al obtener usuario de Firebase:', error);
      this.showError = true;
      this.errorMessage = 'Error al obtener la información del usuario.';
      this.loadingService.hide();
    }
  }

  /**
   * Cargar publicaciones del usuario
   */
  loadUserPublications(): void {
    if (!this.user?.id) return;
    
    this.loadingPublications = true;
    this.userProductivityService.getProductivityByUserId(this.user.id).subscribe({
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
   * Manejar eventos del componente section-info-user (no se usa en este contexto)
   */
  handlerFunctionEmitter(action: string): void {
    // No hay acciones disponibles en modo view
    console.log('Acción recibida pero no implementada:', action);
  }
}

