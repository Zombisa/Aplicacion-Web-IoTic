import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { LoadingService } from '../../../../services/loading.service';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { AuthService } from '../../../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, User } from '@angular/fire/auth';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID, Optional } from '@angular/core';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Header, LoadingPage],
  templateUrl: './update-password.html',
  styleUrls: ['./update-password.css']
})
export class UpdatePassword implements OnInit {
  passwordForm!: FormGroup;
  showError = false;
  errorMessage = '';
  showSuccess = false;
  successMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    public loadingService: LoadingService,
    private fb: FormBuilder,
    @Optional() private afAuth: Auth,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Verificar que el usuario esté autenticado
    this.checkAuthentication();
  }

  private initializeForm(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }

    return null;
  }

  /**
   * Verificar que el usuario esté autenticado
   */
  private async checkAuthentication(): Promise<void> {
    try {
      const firebaseUser = await firstValueFrom(
        this.authService.currentUser.pipe(
          // Esperar hasta que haya un usuario o null
        )
      );

      if (!firebaseUser) {
        this.showError = true;
        this.errorMessage = 'Debes estar autenticado para cambiar tu contraseña.';
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      this.showError = true;
      this.errorMessage = 'Error al verificar la autenticación.';
    }
  }

  async onSubmit(): Promise<void> {
    if (this.passwordForm.valid) {
      if (!isPlatformBrowser(this.platformId) || !this.afAuth) {
        this.showError = true;
        this.errorMessage = 'Esta operación solo está disponible en el navegador.';
        return;
      }

      this.loadingService.show();
      this.showError = false;
      this.showSuccess = false;

      try {
        const formValue = this.passwordForm.value;
        const currentPassword = formValue.currentPassword;
        const newPassword = formValue.newPassword;

        // Obtener el usuario actual de Firebase
        const firebaseUser = this.afAuth.currentUser;
        
        if (!firebaseUser || !firebaseUser.email) {
          throw new Error('No se pudo obtener el usuario autenticado.');
        }

        // Reautenticar al usuario con su contraseña actual
        const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
        await reauthenticateWithCredential(firebaseUser, credential);

        // Actualizar la contraseña
        await updatePassword(firebaseUser, newPassword);

        this.showSuccess = true;
        this.successMessage = 'Contraseña actualizada correctamente. Serás redirigido a tu perfil.';
        this.loadingService.hide();

        // Limpiar el formulario
        this.passwordForm.reset();
        Object.keys(this.passwordForm.controls).forEach(key => {
          const control = this.passwordForm.get(key);
          if (control) {
            control.markAsUntouched();
            control.markAsPristine();
            control.setErrors(null);
          }
        });

        // Redirigir después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/mi-perfil']);
        }, 2000);

      } catch (error: any) {
        console.error('Error al actualizar la contraseña:', error);
        this.loadingService.hide();
        
        // Manejar diferentes tipos de errores
        if (error.code === 'auth/wrong-password') {
          this.showError = true;
          this.errorMessage = 'La contraseña actual es incorrecta.';
        } else if (error.code === 'auth/weak-password') {
          this.showError = true;
          this.errorMessage = 'La nueva contraseña es muy débil. Debe tener al menos 6 caracteres.';
        } else if (error.code === 'auth/requires-recent-login') {
          this.showError = true;
          this.errorMessage = 'Por seguridad, debes iniciar sesión nuevamente antes de cambiar tu contraseña.';
        } else {
          this.showError = true;
          this.errorMessage = error.message || 'Error al actualizar la contraseña. Por favor, intenta nuevamente.';
        }
      }
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/mi-perfil']);
  }

  resetForm(): void {
    if (this.passwordForm) {
      this.passwordForm.reset();
      Object.keys(this.passwordForm.controls).forEach(key => {
        const control = this.passwordForm.get(key);
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
