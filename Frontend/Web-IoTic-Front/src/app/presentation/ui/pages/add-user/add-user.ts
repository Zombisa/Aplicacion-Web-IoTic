import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../templates/header/header';
import { FormCreateUser } from '../../templates/form-create-user/form-create-user';
import { UsersService, CreateUserDTO } from '../../../../services/users.service';
import { LoadingService } from '../../../../services/loading.service';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, Header, FormCreateUser, LoadingPage],
  templateUrl: './add-user.html',
  styleUrls: ['./add-user.css']
})
export class AddUser implements OnInit {
  public roles: { id: number; nombre: string }[] = [];
  public showSuccess = false;
  public showError = false;
  public errorMessage = '';

  constructor(
    private usersService: UsersService,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Primero sincronizar para crear los roles, luego cargar los roles
    this.sincronizarYcargarRoles();
  }

  /**
   * Sincronizar Firebase y luego cargar roles
   */
  sincronizarYcargarRoles(): void {
    console.log('Iniciando sincronización de Firebase...');
    this.loadingService.show();
    
    this.usersService.sincronizarFirebase().subscribe({
      next: (response) => {
        console.log('Sincronización exitosa:', response);
        // Después de sincronizar, cargar los roles
        this.loadRoles();
      },
      error: (error) => {
        console.error('Error al sincronizar Firebase:', error);
        this.loadingService.hide();
        // Aún así intentar cargar roles por si ya existen
        this.loadRoles();
      }
    });
  }

  /**
   * Cargar roles disponibles
   */
  loadRoles(): void {
    console.log('Iniciando carga de roles...');
    this.usersService.getRoles().subscribe({
      next: (data) => {
        console.log('Roles recibidos del servicio:', data);
        this.roles = data;
        console.log('Roles asignados al componente:', this.roles);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.loadingService.hide();
        this.showError = true;
        this.errorMessage = 'Error al cargar los roles. Por favor, recarga la página.';
      }
    });
  }

  /**
   * Manejar creación de usuario
   */
  onCreateUser(userData: CreateUserDTO): void {
    this.loadingService.show();
    this.showError = false;
    this.showSuccess = false;

    this.usersService.createUser(userData).subscribe({
      next: () => {
        this.loadingService.hide();
        this.showSuccess = true;
        setTimeout(() => {
          this.router.navigate(['/usuarios']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        this.loadingService.hide();
        this.showError = true;
        this.errorMessage = error.error?.error || error.error?.message || 'Error al crear el usuario. Por favor, intente nuevamente.';
      }
    });
  }

  /**
   * Cancelar creación
   */
  onCancel(): void {
    this.router.navigate(['/usuarios']);
  }

  /**
   * Ocultar mensajes
   */
  hideMessages(): void {
    this.showSuccess = false;
    this.showError = false;
  }
}
