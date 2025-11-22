import { Component, Input, OnInit } from '@angular/core';
import { LoanService } from '../../../../services/Loan.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, SelectMultipleControlValueAccessor, Validators } from '@angular/forms';
import { LoanPeticion } from '../../../../models/Peticion/LoanPeticion';
import { LoanDTO } from '../../../../models/DTO/LoanDTO';
import { CommonModule } from '@angular/common';
import { fechaFuturaValidator } from '../../../../validators/fecha-futura-vaidators';
import { timeEnd } from 'node:console';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-person-loan',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-person-loan.html',
  styleUrl: './form-person-loan.css'
})
export class FormPersonLoan implements OnInit {

  @Input() idItem?: number;
  isLoading = false;
  showSuccess = false;
  showError = false;
  buttonDissabled = false;
  loanForm!: FormGroup;
  successMessage = '';
  errorMessage = '';

  constructor(
    private loanService: LoanService,
    private router: Router,
    private fb: FormBuilder,) { } 
  ngOnChanges() {
    console.log("📥 idItem recibido:", this.idItem);
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Envía el formulario para crear un nuevo préstamo
   * Muestra mensajes de éxito o error según la respuesta del servidor
   */
 onSubmit(): void {
  if (this.loanForm.invalid) {
    Object.values(this.loanForm.controls).forEach(ctrl => ctrl.markAsTouched());
    return;
  }

  this.isLoading = true;
  const formData = this.loanForm.getRawValue();
  const loanData: LoanPeticion = {
    ...formData,
    item_id: this.idItem!
  };

  console.log('🚀 Enviando datos del préstamo:', loanData);
  this.loanService.createLoan(loanData).subscribe({
    next: (response: LoanDTO) => {
      console.log('✅ Respuesta del servidor:', response);
      this.isLoading = false;
      this.buttonDissabled = true;
      this.showSuccess = true;
      this.successMessage = 'Préstamo creado exitosamente.';
      setTimeout(() => {
        this.router.navigate(['/inventario']); // Cambia la ruta según tu app
      }, 1500);
      
    },
    error: (error: unknown) => {
      console.error('❌ Error completo:', error);
      this.isLoading = false;
      this.showError = true;

      if (typeof error === 'object' && error && 'error' in error) {
        const err = error as { error?: { message?: string } };
        this.errorMessage =
          `Error al crear el préstamo: ${err.error?.message || 'Error desconocido'}`;
      } else {
        this.errorMessage = 'Error inesperado al crear el préstamo.';
      }
    }
  });
}

/**
 * Inicializa el formulario reactivo con validaciones
 * Crea un FormGroup y lo asigna a la propiedad LoanForm
 */
initializeForm() {
    this.loanForm = this.fb.group({
      nombre_persona: ['', [Validators.required, Validators.minLength(3)]],
      item_id: [this.idItem],
      cedula: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      telefono: ['', [ Validators.pattern(/^\d{10}$/), Validators.required]],
      correo: ['', [Validators.email, Validators.required]],
      direccion: ['', Validators.required],
      fecha_limite: ['', [Validators.required, fechaFuturaValidator]],
    });
  }

  //  Limpia el formulario
  resetForm(): void {
    this.loanForm.reset();
    this.hideMessages();
  }  
  //  Oculta los mensajes de éxito/error
  hideMessages(): void {
    this.showSuccess = false;
    this.showError = false;
  }

} 
