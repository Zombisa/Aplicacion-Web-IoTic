import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  constructor(private authService: AuthService) {}

  async onLogin() {
    try {
      await this.authService.login(this.correo, this.password);
      // Validar token contra backend
      await this.authService.fetchCurrentUserFromBackend();
      location.assign('/home');
    } catch (error) {
      alert('Correo o contraseña incorrectos');
    }
  }
}
