import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.css']
})
export class LoginPage {
  correo: string = '';
  nombre: string = '';
  password: string = '';
  
  // Estados para feedback visual
  isLoading: boolean = false;
  showError: boolean = false;
  errorMessage: string = '';
  showSuccess: boolean = false;
  successMessage: string = '';
  errorType: string = '';
  
  // Estados para errores específicos de campos
  emailError: string = '';
  passwordError: string = '';
  
  // Estados para modal de credenciales
  showCredentialsModal: boolean = false;
  credentialsMessage: string = '';
  
  // Contador de intentos fallidos
  failedAttempts: number = 0;
  maxAttempts: number = 5;
  isBlocked: boolean = false;
  blockTimeRemaining: number = 0;

  constructor(private authService: AuthService) {
    console.log('LoginPage - Constructor iniciado');
    
    // Suscribirse a los observables de debug para monitorear el estado
    this.authService.debugIsLoggedIn$.subscribe(isLoggedIn => {
      console.log('Debug - Is Logged In:', isLoggedIn);
    });

    this.authService.debugIsAdmin$.subscribe(isAdmin => {
      console.log('Debug - Is Admin:', isAdmin);
    });

    this.authService.debugUserClaims$.subscribe(claims => {
      console.log('Debug - User Claims:', claims);
    });

    // Mostrar estado actual al cargar el componente
    console.log('Debug - Current Auth State:', this.authService.getCurrentAuthState());
  }

  async onLogin(form: NgForm) {
    if (form.invalid) {
      this.showErrorMessage('Por favor, completa todos los campos correctamente');
      return;
    }

    if (this.isBlocked) {
      this.showErrorMessage(`Demasiados intentos fallidos. Intenta nuevamente en ${this.blockTimeRemaining} segundos`);
      return;
    }

    this.isLoading = true;
    this.hideMessages();

    try {
      console.log('Starting login process...');
      console.log('Auth state before login:', this.authService.getCurrentAuthState());
      
      const result = await this.authService.login(this.correo, this.password);
      
      if (result.success) {
        console.log('Login successful!');
        this.failedAttempts = 0; // Reset contador de intentos fallidos
        this.showSuccessMessage('Inicio de sesión exitoso. Redirigiendo...');
        
        // Esperar un poco para que se actualicen los observables
        setTimeout(() => {
          console.log('Auth state after login:', this.authService.getCurrentAuthState());
          location.assign('/home');
        }, 2000); // tiempo para ver los logs
      } else {
        console.log('Login failed:', result);
        this.handleLoginError(result);
      }
    } catch (error: any) {
      this.handleLoginError({
        success: false,
        errorType: 'network_error',
        errorMessage: 'Error de conexión. Verifica tu internet e intenta nuevamente'
      });
      console.error('Error de login:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private handleLoginError(result: { success: boolean; errorType?: string; errorMessage?: string; blocked?: boolean; retryAfter?: number }) {
    this.failedAttempts++;
    this.errorType = result.errorType || 'other';
    
    // Limpiar errores previos de campos
    this.clearFieldErrors();
    
    // Si la IP está bloqueada, manejar de forma especial
    if (result.blocked) {
      this.handleIPBlocked(result.retryAfter || 900);
      return;
    }
    
    // Manejar errores específicos de campos
    switch (result.errorType) {
      case 'user_not_found':
        this.emailError = 'El usuario no existe';
        this.showCredentialsModal = true;
        this.credentialsMessage = this.buildCredentialsMessage();
        break;
      case 'wrong_password':
        this.passwordError = 'Contraseña incorrecta';
        this.showCredentialsModal = true;
        this.credentialsMessage = this.buildCredentialsMessage();
        break;
      case 'invalid_email':
        this.emailError = 'El formato del correo electrónico no es válido';
        break;
      case 'invalid_credential':
        this.emailError = 'Correo o contraseña incorrectos';
        this.passwordError = 'Correo o contraseña incorrectos';
        this.showCredentialsModal = true;
        this.credentialsMessage = this.buildCredentialsMessage();
        break;
      case 'account_disabled':
        this.showErrorMessage('Tu cuenta ha sido deshabilitada. Contacta al administrador.');
        break;
      case 'account_locked':
        this.showErrorMessage('Tu cuenta ha sido bloqueada por seguridad. Contacta al administrador.');
        break;
      case 'email_not_verified':
        this.emailError = 'Debes verificar tu correo electrónico';
        break;
      case 'weak_password':
        this.passwordError = 'La contraseña debe tener al menos 6 caracteres';
        break;
      case 'too_many_attempts':
        this.showErrorMessage('Demasiados intentos fallidos. Intenta más tarde.');
        this.blockUser();
        break;
      case 'ip_blocked':
        this.showErrorMessage('Tu IP ha sido bloqueada temporalmente por demasiados intentos fallidos.');
        this.handleIPBlocked(result.retryAfter || 900);
        return;
      case 'network_error':
        this.showErrorMessage('Error de conexión. Verifica tu internet e intenta nuevamente.');
        break;
      case 'server_error':
        this.showErrorMessage('Error del servidor. Intenta nuevamente en unos minutos.');
        break;
      default:
        this.showErrorMessage(result.errorMessage || 'Error de autenticación');
    }
    
    // Bloquear usuario si excede intentos máximos
    if (this.failedAttempts >= this.maxAttempts) {
      this.blockUser();
    }
  }

  private buildCredentialsMessage(): string {
    const remaining = this.maxAttempts - this.failedAttempts;
    let message = `Credenciales incorrectas. Intento ${this.failedAttempts}/${this.maxAttempts}`;
    
    if (remaining > 0) {
      message += ` (${remaining} intentos restantes)`;
    }
    
    message += '\n\nVerifica que:';
    message += '\n• El correo electrónico esté escrito correctamente';
    message += '\n• La contraseña sea la correcta';
    
    return message;
  }

  private clearFieldErrors() {
    this.emailError = '';
    this.passwordError = '';
  }

  private handleIPBlocked(retryAfter: number) {
    this.isBlocked = true;
    this.blockTimeRemaining = retryAfter;
    
    const errorMsg = `Tu IP ha sido bloqueada temporalmente por demasiados intentos fallidos. Intenta nuevamente en ${this.formatTime(retryAfter)}.`;
    this.showErrorMessage(errorMsg);
    
    const interval = setInterval(() => {
      this.blockTimeRemaining--;
      if (this.blockTimeRemaining <= 0) {
        clearInterval(interval);
        this.isBlocked = false;
        this.failedAttempts = 0;
        this.hideMessages();
      }
    }, 1000);
  }

  private blockUser() {
    this.isBlocked = true;
    this.blockTimeRemaining = 300; // 5 minutos
    
    const interval = setInterval(() => {
      this.blockTimeRemaining--;
      if (this.blockTimeRemaining <= 0) {
        clearInterval(interval);
        this.isBlocked = false;
        this.failedAttempts = 0;
        this.hideMessages();
      }
    }, 1000);
  }

  private showErrorMessage(message: string) {
    this.errorMessage = message;
    this.showError = true;
    this.showSuccess = false;
  }

  private showSuccessMessage(message: string) {
    this.successMessage = message;
    this.showSuccess = true;
    this.showError = false;
  }

  hideMessages() {
    this.showError = false;
    this.showSuccess = false;
  }

  onInputChange() {
    this.hideMessages();
    this.clearFieldErrors();
  }

  closeCredentialsModal() {
    this.showCredentialsModal = false;
    this.credentialsMessage = '';
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
