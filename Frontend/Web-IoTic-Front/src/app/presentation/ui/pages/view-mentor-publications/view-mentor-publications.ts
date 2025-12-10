import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../templates/header/header';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../../services/users.service';
import { UserDTO } from '../../../../models/DTO/UserDTO';
import { LoadingService } from '../../../../services/loading.service';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { UserProductivityService, UserProductivityItem } from '../../../../services/information/user-productivity.service';

@Component({
  selector: 'app-view-mentor-publications',
  standalone: true,
  imports: [CommonModule, Header, LoadingPage],
  templateUrl: './view-mentor-publications.html',
  styleUrls: ['./view-mentor-publications.css']
})
export class ViewMentorPublications implements OnInit {
  userId!: number;
  user?: UserDTO;
  publications: UserProductivityItem[] = [];
  loadingPublications = false;
  showError = false;
  errorMessage = '';

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
        this.userId = parseInt(idParam, 10);
        this.getUserById();
        this.loadUserPublications();
      }
    });
  }

  getUserById(): void {
    this.loadingService.show();
    // Obtener el usuario de la lista de usuarios ya que el endpoint individual puede no estar disponible
    this.usersService.getUsers().subscribe({
      next: (users) => {
        const foundUser = users.find(u => u.id === this.userId);
        if (foundUser) {
          this.user = foundUser;
          this.loadingService.hide();
        } else {
          this.showError = true;
          this.errorMessage = 'Usuario no encontrado.';
          this.loadingService.hide();
        }
      },
      error: (error) => {
        console.error('Error al cargar usuario:', error);
        this.showError = true;
        this.errorMessage = 'No se pudo cargar la información del usuario.';
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
      'material-didactico': 'material-didactico',
      'jurado': 'jurado',
      'proceso-tecnica': 'procesos'
    };

    const route = routeMap[tipo];
    if (route) {
      this.router.navigate([`/productividad/${route}`, id]);
    } else {
      console.warn(`No hay ruta específica para el tipo: ${tipo}`);
      this.router.navigate([`/productividad/lista/${tipo}`]);
    }
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  getFullName(): string {
    if (!this.user) return '';
    return `${this.user.nombre} ${this.user.apellido}`.trim() || this.user.email;
  }

  /**
   * Volver a la lista de mentores
   */
  goBack(): void {
    this.router.navigate(['/mentores-publicaciones']);
  }
}

