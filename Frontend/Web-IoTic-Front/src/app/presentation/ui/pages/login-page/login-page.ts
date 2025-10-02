import { Component } from '@angular/core';
import { InputText } from '../../atoms/input-text/input-text';
import { ButtonPrimary } from '../../atoms/button-primary/button-primary';
import { CommonEngine } from '@angular/ssr/node';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  imports: [ CommonModule, FormsModule, InputText, ButtonPrimary ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage {
  correo: string = '';
  nombre: string = '';
  password: string = '';

  correoError: boolean = true;
  nombreError: boolean = true;
  passwordError: boolean = true;

  onLogin(form: NgForm) {
    if (form.valid) {
      console.log(form.value); // { email: "...", password: "..." }
    }
  }
}
