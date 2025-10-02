import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-text',
  imports: [FormsModule, CommonModule],
  templateUrl: './input-text.html',
  styleUrl: './input-text.css'
})
export class InputText {
  @Input() label: string = '';
  @Input() type: 'text' | 'email' | 'password' = 'text';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() value: string = '';
  @Input() inputId: string = 'input-' + Math.random().toString(36).substring(2, 9);

  @Output() errorState = new EventEmitter<boolean>();
  showError: boolean = false;
  errorMessage: string = '';

  onChange(val: string) {
    this.value = val;
    this.validate();
  }

  validate() {
    if (this.required && !this.value) {
      this.showError = true;
      this.errorMessage = 'Este campo es obligatorio.';
      this.errorState.emit(true);
      return;
    }
    if (this.type === 'email' && this.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value)) {
      this.showError = true;
      this.errorMessage = 'Ingrese un correo válido.';
      this.errorState.emit(true);
      return;
    }
    if (this.type === 'password' && this.value && this.value.length < 6) {
      this.showError = true;
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      this.errorState.emit(true);
      return;
    }
    this.showError = false;
    this.errorState.emit(false);
    this.errorMessage = '';
  }
}
