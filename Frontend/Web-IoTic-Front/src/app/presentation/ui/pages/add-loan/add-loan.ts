import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoanService } from '../../../../services/Loan.service';
import { InventoryService } from '../../../../services/inventory.service';
import { Header } from '../../templates/header/header';
import { LoanPeticion } from '../../../../models/Peticion/LoanPeticion';
import { LoanDTO } from '../../../../models/DTO/LoanDTO';
import { ItemDTO } from '../../../../models/DTO/ItemDTO';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-loan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Header],
  templateUrl: './add-loan.html',
  styleUrls: ['./add-loan.css']
})
export class AddLoan implements OnInit {
  
  isLoading = false;
  showSuccess = false;
  showError = false;

  loanForm!: FormGroup;
  successMessage = '';
  errorMessage = '';
  availableItems: ItemDTO[] = [];
  itemId!: number;

  constructor(
    private fb: FormBuilder,
    private loanService: LoanService,
    private inventoryService: InventoryService,
    private route: ActivatedRoute
  ) {}

  /**
   * Inicialización del componente
   * Obtiene el id de la url
   * Inicializa el formulario
   * Carga los items disponibles
   */
  ngOnInit() {
    this.itemId = Number(this.route.snapshot.paramMap.get('id'));
    this.initializeForm();
    this.loadAvailableItems();
  }

  initializeForm() {
    this.loanForm = this.fb.group({
      nombre_persona: ['', [Validators.required, Validators.minLength(3)]],
      item_id: ['', [Validators.required]],
    });
  }
loadAvailableItems(): void {
  this.inventoryService.getElectronicComponent().subscribe({
    next: (items) => {
      this.availableItems = items;
    },
    error: (error: unknown) => {
      console.error('Error al cargar los items:', error);
    }
  });
}

onSubmit(): void {
  if (this.loanForm.valid) {
    this.isLoading = true;

    const formValue = this.loanForm.value;

    const loanData: LoanPeticion = this.loanForm.getRawValue();

    console.log('📦 Datos del préstamo a enviar:', loanData);

    this.loanService.createLoan(loanData).subscribe({
      next: (response: LoanDTO) => {
        console.log('✅ Respuesta del servidor:', response);
        this.isLoading = false;
        this.showSuccess = true;
        this.successMessage = 'Préstamo creado exitosamente.';
        this.resetForm();
      },
      error: (error: unknown) => {
        console.error('❌ Error completo:', error);
        this.isLoading = false;
        this.showError = true;
        if (typeof error === 'object' && error && 'error' in error) {
          const err = error as { error?: { message?: string } };
          this.errorMessage = `Error al crear el préstamo: ${err.error?.message || 'Error desconocido'}`;
        } else {
          this.errorMessage = 'Error inesperado al crear el préstamo.';
        }
      }
    });
  } else {
    Object.keys(this.loanForm.controls).forEach(key => {
      this.loanForm.get(key)?.markAsTouched();
    });
  }
}
 

  // 🔹 Limpia el formulario
  resetForm(): void {
    this.loanForm.reset();
    this.hideMessages();
  }

  // 🔹 Oculta los mensajes de éxito/error
  hideMessages(): void {
    this.showSuccess = false;
    this.showError = false;
  }
}
