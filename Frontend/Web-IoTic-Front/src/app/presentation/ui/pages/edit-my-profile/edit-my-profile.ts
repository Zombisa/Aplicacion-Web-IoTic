import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { UsersService, UpdateUserDTO } from '../../../../services/users.service';
import { UserDTO } from '../../../../models/DTO/UserDTO';
import { LoadingService } from '../../../../services/loading.service';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { AuthService } from '../../../../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-my-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Header, LoadingPage],
  templateUrl: './edit-my-profile.html',
  styleUrls: ['./edit-my-profile.css']
})
export class EditMyProfile implements OnInit {
  user?: UserDTO;
  userForm!: FormGroup;
  showError = false;
  errorMessage = '';
  showSuccess = false;
  successMessage = '';

  constructor(
    private router: Router,
    private usersService: UsersService,
    private authService: AuthService,
    public loadingService: LoadingService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
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
            this.populateForm();
            this.loadingService.hide();
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

  private populateForm(): void {
    if (this.user && this.userForm) {
      this.userForm.patchValue({
        nombre: this.user.nombre || '',
        apellido: this.user.apellido || '',
        email: this.user.email || ''
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.valid && this.user) {
      this.loadingService.show();
      this.showError = false;
      this.showSuccess = false;

      const formValue = this.userForm.value;
      const updateData: UpdateUserDTO = {
        nombre: formValue.nombre,
        apellido: formValue.apellido,
        email: formValue.email
        // No incluimos el rol porque el usuario no puede cambiar su propio rol
      };

      this.usersService.updateUser(this.user.id, updateData).subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          this.showSuccess = true;
          this.successMessage = 'Perfil actualizado correctamente.';
          this.loadingService.hide();
          
          // Redirigir después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/mi-perfil']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error al actualizar el perfil:', error);
          this.showError = true;
          this.errorMessage = error.error?.message || 'Error al actualizar el perfil. Por favor, intenta nuevamente.';
          this.loadingService.hide();
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/mi-perfil']);
  }

  resetForm(): void {
    if (this.userForm) {
      // Resetear valores al estado original del usuario
      this.populateForm();

      // Limpiar el estado de validación de todos los controles
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        if (control) {
          control.markAsUntouched();
          control.markAsPristine();
          control.setErrors(null);
        }
      });
    }
    this.showError = false;
    this.showSuccess = false;
  }
}
