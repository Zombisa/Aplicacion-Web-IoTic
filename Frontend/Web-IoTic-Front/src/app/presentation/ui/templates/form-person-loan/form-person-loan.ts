import { Component, Input, OnInit } from '@angular/core';
import { LoanService } from '../../../../services/Loan.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, SelectMultipleControlValueAccessor, Validators } from '@angular/forms';
import { LoanPeticion } from '../../../../models/Peticion/LoanPeticion';
import { LoanDTO } from '../../../../models/DTO/LoanDTO';
import { CommonModule } from '@angular/common';
import { fechaFuturaValidator } from '../../../../validators/fecha-futura-vaidators';
import { cedulaValidator } from '../../../../validators/cedula-validator';
import { telefonoValidator } from '../../../../validators/telefono-validator';
import { timeEnd } from 'node:console';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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
  hoy!: string; 

  constructor(
    private loanService: LoanService,
    private router: Router,
    private fb: FormBuilder,) { } 
  ngOnChanges() {
    console.log("📥 idItem recibido:", this.idItem);
  }

  ngOnInit(): void {
    this.initializeForm();
    const today = new Date();
    // Formateamos como YYYY-MM-DD
    this.hoy = today.toISOString().split('T')[0];
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

  // 🔥 Convertir fecha a ISO con zona horaria
  if (formData.fecha_limite) {
    formData.fecha_limite = new Date(formData.fecha_limite + "T00:00:00Z").toISOString();
  }

  const loanData: LoanPeticion = {
    ...formData,
    item_id: this.idItem!
  };

  console.log('🚀 Enviando datos del préstamo:', loanData);
  this.loanService.createLoan(loanData).subscribe({
    next: (response: LoanDTO) => {
     Swal.fire({
        icon: 'success',
        title: 'Préstamo creado',
        text: 'El préstamo ha sido creado exitosamente.',
        buttonsStyling: true,
        customClass: {
          confirmButton: 'btn btn-success'
        }, 
        confirmButtonText: 'Aceptar'
      }).then(() => {
        this.router.navigate(['/inventario']);
      });
    },
    error: (error: unknown) => {
      console.error('❌ Error completo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al crear el préstamo',
        text: 'Ha ocurrido un error al intentar crear el préstamo. Por favor, inténtalo de nuevo más tarde.',
        buttonsStyling: true,
        customClass: {
          confirmButton: 'btn btn-danger'
        } 
        
      });
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
      cedula: ['', [Validators.required, cedulaValidator]],
      telefono: ['', [Validators.required, telefonoValidator]],
      correo: ['', [Validators.email, Validators.required]],
      direccion: ['', Validators.required],
      fecha_limite: ['', [Validators.required]],
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
