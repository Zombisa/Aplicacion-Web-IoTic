import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../templates/header/header';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../../services/users.service';
import { UserDTO } from '../../../../models/DTO/UserDTO';
import { LoadingService } from '../../../../services/loading.service';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { UserProductivityService, UserProductivityItem } from '../../../../services/information/user-productivity.service';
import { PublicationsList } from '../../templates/publications-list/publications-list';

interface PublicationsByType {
  tipo: string;
  tipoDisplay: string;
  publications: UserProductivityItem[];
}

@Component({
  selector: 'app-view-mentor-publications',
  standalone: true,
  imports: [CommonModule, Header, LoadingPage, PublicationsList],
  templateUrl: './view-mentor-publications.html',
  styleUrls: ['./view-mentor-publications.css']
})
export class ViewMentorPublications implements OnInit {
  userId!: number;
  user?: UserDTO;
  publications: UserProductivityItem[] = [];
  publicationsByType: PublicationsByType[] = [];
  filteredPublicationsByType: PublicationsByType[] = [];
  loadingPublications = false;
  showError = false;
  errorMessage = '';
  searchTerm = '';
  readonly showEditButton = false;

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

  trackBySection(index: number, section: PublicationsByType): string {
    return section.tipo;
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

