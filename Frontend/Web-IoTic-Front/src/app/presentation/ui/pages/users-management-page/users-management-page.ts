import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../templates/header/header';
import { UserDTO } from '../../../../models/DTO/UserDTO';
import { UsersService, UpdateUserDTO, CreateUserDTO } from '../../../../services/users.service';
import { UsersTable } from '../../templates/users-table/users-table';
import { FormEditUser } from '../../templates/form-edit-user/form-edit-user';
import { ConfirmationModal } from '../../templates/confirmation-modal/confirmation-modal';
import { Router } from '@angular/router';
import { LoadingService } from '../../../../services/loading.service';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { AuthService } from '../../../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-users-management-page',
  standalone: true,
  imports: [CommonModule, Header, UsersTable, LoadingPage, FormEditUser, ConfirmationModal],
  templateUrl: './users-management-page.html',
  styleUrls: ['./users-management-page.css']
})
export class UsersManagementPageComponent implements OnInit {
  public usersData: UserDTO[] = [];
  public roles: { id: number; nombre: string }[] = [];
  public showEditForm = false;
  public selectedUserForEdit: UserDTO | null = null;
  public showDeleteModal = false;
  public userToDelete: UserDTO | null = null;
  public isAdmin$: Observable<boolean>;

  constructor(
    private usersService: UsersService,
    public loadingService: LoadingService,
    private router: Router,
    private authService: AuthService
  ) {
    this.isAdmin$ = this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.loadUsersData();
    this.loadRoles();
  }

  /**
   * Cargar datos de usuarios desde el backend
   */
  loadUsersData(): void {
    this.loadingService.show();
    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.usersData = data;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.loadingService.hide();
      }
    });
  }

  /**
   * Cargar roles disponibles
   */
  loadRoles(): void {
    this.usersService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
      }
    });
  }

  /**
   * Manejar la selección de un usuario
   */
  onUserSelected(user: UserDTO): void {
    console.log('Usuario seleccionado:', user);
    if (user && user.id) {
      // Navegar a la página de detalle del usuario
      this.router.navigate(['/usuarios/view', user.id]).catch(error => {
        console.error('Error al navegar:', error);
      });
    } else {
      console.error('Usuario inválido o sin ID:', user);
    }
  }

  /**
   * Manejar edición de usuario
   */
  onEditUser(user: UserDTO): void {
    // Crear una copia del usuario para forzar la detección de cambios
    this.selectedUserForEdit = { ...user };
    this.showEditForm = true;
  }

  /**
   * Manejar actualización de usuario
   */
  onUpdateUser(updateData: UpdateUserDTO): void {
    if (!this.selectedUserForEdit) return;

    this.loadingService.show();
    this.usersService.updateUser(this.selectedUserForEdit.id, updateData).subscribe({
      next: () => {
        this.loadUsersData();
        this.showEditForm = false;
        this.selectedUserForEdit = null;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al actualizar usuario:', error);
        this.loadingService.hide();
        alert('Error al actualizar el usuario. Por favor, intente nuevamente.');
      }
    });
  }

  /**
   * Cancelar edición
   */
  onCancelEdit(): void {
    this.showEditForm = false;
    this.selectedUserForEdit = null;
  }

  /**
   * Manejar cambio de estado (activar/desactivar)
   */
  onToggleStatus(user: UserDTO): void {
    this.loadingService.show();
    this.usersService.toggleUserStatus(user.id).subscribe({
      next: () => {
        this.loadUsersData();
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al cambiar estado del usuario:', error);
        this.loadingService.hide();
        alert('Error al cambiar el estado del usuario. Por favor, intente nuevamente.');
      }
    });
  }

  /**
   * Manejar eliminación de usuario
   */
  onDeleteUser(user: UserDTO): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  /**
   * Confirmar eliminación
   */
  confirmDelete(): void {
    if (!this.userToDelete) return;

    this.loadingService.show();
    this.usersService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.loadUsersData();
        this.showDeleteModal = false;
        this.userToDelete = null;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al eliminar usuario:', error);
        this.loadingService.hide();
        alert('Error al eliminar el usuario. Por favor, intente nuevamente.');
      }
    });
  }

  /**
   * Cancelar eliminación
   */
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  /**
   * Navegar a la página de crear usuario
   */
  goToAddUser(): void {
    this.router.navigate(['/usuarios/add']);
  }
}

