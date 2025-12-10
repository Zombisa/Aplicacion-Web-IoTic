import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../templates/header/header';
import { MentorPublicationsCard } from '../../templates/mentor-publications-card/mentor-publications-card';
import { UserDTO } from '../../../../models/DTO/UserDTO';
import { UsersService } from '../../../../services/users.service';
import { UserProductivityService, UserProductivityItem } from '../../../../services/information/user-productivity.service';
import { LoadingService } from '../../../../services/loading.service';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface UserWithPublications {
  user: UserDTO;
  publications: UserProductivityItem[];
  isLoading: boolean;
}

@Component({
  selector: 'app-mentors-publications-page',
  standalone: true,
  imports: [CommonModule, Header, MentorPublicationsCard, LoadingPage],
  templateUrl: './mentors-publications-page.html',
  styleUrls: ['./mentors-publications-page.css']
})
export class MentorsPublicationsPage implements OnInit {
  usersWithPublications: UserWithPublications[] = [];

  constructor(
    private usersService: UsersService,
    private userProductivityService: UserProductivityService,
    public loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadUsersAndPublications();
  }

  /**
   * Carga todos los usuarios y sus publicaciones, mostrando solo los que tienen publicaciones
   */
  loadUsersAndPublications(): void {
    this.loadingService.show();
    
    this.usersService.getUsers().subscribe({
      next: (users) => {
        if (users.length === 0) {
          this.loadingService.hide();
          return;
        }

        // Cargar publicaciones para todos los usuarios en paralelo
        const publicationRequests = users.map(user => 
          this.userProductivityService.getProductivityByUserId(user.id).pipe(
            catchError(error => {
              console.error(`Error al cargar publicaciones para ${user.email} (ID: ${user.id}):`, error);
              return of([]);
            })
          )
        );

        forkJoin(publicationRequests).subscribe({
          next: (publicationsArrays) => {
            // Filtrar solo usuarios que tienen al menos una publicación
            this.usersWithPublications = users
              .map((user, index) => {
                const publications = publicationsArrays[index] || [];
                console.log(`Usuario ${user.email} (ID: ${user.id}) tiene ${publications.length} publicaciones:`, {
                  total: publications.length,
                  porTipo: {
                    libros: publications.filter(p => p.tipo === 'libro').length,
                    capitulos: publications.filter(p => p.tipo === 'capitulo').length,
                    revistas: publications.filter(p => p.tipo === 'revista').length,
                    cursos: publications.filter(p => p.tipo === 'curso').length,
                    eventos: publications.filter(p => p.tipo === 'evento').length,
                    software: publications.filter(p => p.tipo === 'software').length,
                    otros: publications.filter(p => !['libro', 'capitulo', 'revista', 'curso', 'evento', 'software'].includes(p.tipo)).length
                  },
                  todasLasPublicaciones: publications.map(p => ({ titulo: p.titulo, tipo: p.tipo, tipoDisplay: p.tipoDisplay }))
                });
                return {
                  user,
                  publications,
                  isLoading: false
                };
              })
              .filter(item => item.publications.length > 0);
            
            console.log('Usuarios con publicaciones finales:', this.usersWithPublications.map(u => ({
              usuario: u.user.email,
              totalPublicaciones: u.publications.length,
              tipos: [...new Set(u.publications.map(p => p.tipo))]
            })));
            
            this.loadingService.hide();
          },
          error: (error) => {
            console.error('Error al cargar publicaciones:', error);
            this.usersWithPublications = [];
            this.loadingService.hide();
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.loadingService.hide();
      }
    });
  }
}

