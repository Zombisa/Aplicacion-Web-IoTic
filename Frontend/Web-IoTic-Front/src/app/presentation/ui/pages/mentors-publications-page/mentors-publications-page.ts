import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../templates/header/header';
import { UserDTO } from '../../../../models/DTO/UserDTO';
import { UsersService } from '../../../../services/users.service';
import { LoadingService } from '../../../../services/loading.service';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mentors-publications-page',
  standalone: true,
  imports: [CommonModule, Header, LoadingPage],
  templateUrl: './mentors-publications-page.html',
  styleUrls: ['./mentors-publications-page.css']
})
export class MentorsPublicationsPage implements OnInit {
  users: UserDTO[] = [];

  constructor(
    private usersService: UsersService,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Carga todos los usuarios (incluyendo admin)
   */
  loadUsers(): void {
    this.loadingService.show();
    
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loadingService.hide();
        console.log('Usuarios cargados:', users.length);
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.users = [];
        this.loadingService.hide();
      }
    });
  }

  /**
   * Navega a la página de detalle del usuario
   */
  navigateToUser(userId: number): void {
    this.router.navigate(['/mentores-publicaciones', userId]);
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  getFullName(user: UserDTO): string {
    return `${user.nombre} ${user.apellido}`.trim() || user.email;
  }
}

