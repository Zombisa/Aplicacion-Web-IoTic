import { Component } from '@angular/core';
import { InputText } from '../../atoms/input-text/input-text';
import { ButtonPrimary } from '../../atoms/button-primary/button-primary';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, ButtonPrimary],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage {
  correo: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onLogin() {
    try {
      await this.authService.login(this.correo, this.password);
      this.router.navigate(['/home']);
    } catch (error) {
      alert('Correo o contraseña incorrectos');
    }
  }
}