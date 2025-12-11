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

interface PublicationsByType {
  tipo: string;
  tipoDisplay: string;
  publications: UserProductivityItem[];
}

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
  publicationsByType: PublicationsByType[] = [];
  filteredPublicationsByType: PublicationsByType[] = [];
  searchTerm = '';
  loadingPublications = false;

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
        this.groupPublicationsByType();
        this.applyFilter();
        this.loadingPublications = false;
        console.log('Publicaciones del usuario:', publications);
      },
      error: (error) => {
        console.error('Error al cargar publicaciones del usuario:', error);
        this.publications = [];
        this.publicationsByType = [];
        this.filteredPublicationsByType = [];
        this.loadingPublications = false;
      }
    });
  }

  /**
   * Agrupa las publicaciones por tipo de productividad
   */
  groupPublicationsByType(): void {
    this.publicationsByType = [];
    if (!this.publications || this.publications.length === 0) return;

    const grouped = new Map<string, UserProductivityItem[]>();

    this.publications.forEach(publication => {
      if (!publication.tipo) return;
      if (!grouped.has(publication.tipo)) {
        grouped.set(publication.tipo, []);
      }
      grouped.get(publication.tipo)!.push(publication);
    });

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

    this.publicationsByType = this.typeOrder
      .map(tipo => {
        const publications = grouped.get(tipo);
        if (publications && publications.length > 0) {
          const firstPub = publications[0];
          return {
            tipo,
            tipoDisplay: firstPub.tipoDisplay || tipoDisplayMap[tipo] || tipo,
            publications: [...publications].sort((a, b) => (b.id || 0) - (a.id || 0))
          };
        }
        return null;
      })
      .filter((item): item is PublicationsByType => item !== null);

    grouped.forEach((publications, tipo) => {
      if (!this.typeOrder.includes(tipo)) {
        const firstPub = publications[0];
        this.publicationsByType.push({
          tipo,
          tipoDisplay: firstPub.tipoDisplay || tipoDisplayMap[tipo] || tipo,
          publications: [...publications].sort((a, b) => (b.id || 0) - (a.id || 0))
        });
      }
    });
  }

  /**
   * Aplica filtro por título sobre las publicaciones agrupadas
   */
  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredPublicationsByType = this.publicationsByType.map(section => ({
        ...section,
        publications: [...section.publications]
      }));
      return;
    }

    this.filteredPublicationsByType = this.publicationsByType
      .map(section => {
        const pubs = section.publications.filter(pub => (pub.titulo || '').toLowerCase().includes(term));
        if (pubs.length === 0) return null;
        return { ...section, publications: pubs };
      })
      .filter((section): section is PublicationsByType => section !== null);
  }

  onFilterChange(value: string): void {
    this.searchTerm = value;
    this.applyFilter();
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
      'tutoria-concluida': 'tutoria-concluida',
      'tutoria-en-marcha': 'tutoria-en-marcha',
      'trabajo-eventos': 'trabajo-eventos',
      'participacion-comites': 'participacion_comites_ev',
      'material-didactico': 'material-didactico',
      'jurado': 'jurado',
      'proceso-tecnica': 'proceso_tecnica'
    };

    const route = routeMap[event.tipo] || event.tipo;
    if (route && event.id) {
      this.router.navigate(['/productividad', route, event.id]);
    }
  }

  trackBySection(index: number, section: PublicationsByType): string {
    return section.tipo;
  }

  /**
   * Manejar eventos del componente section-info-user (no se usa en este contexto)
   */
  handlerFunctionEmitter(action: string): void {
    // No hay acciones disponibles en modo view
    console.log('Acción recibida pero no implementada:', action);
  }
}

