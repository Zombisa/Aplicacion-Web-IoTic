import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IoanService } from '../../../../services/ioan.service';
import { InventoryService } from '../../../../services/inventory.service';
import { Header } from '../../templates/header/header';
import { IoanPeticion } from '../../../../models/Peticion/IoanPeticion';
import { LoanDTO } from '../../../../models/DTO/IoanDTO';

@Component({
  selector: 'app-add-loan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Header],
  templateUrl: './add-loan.html',
  styleUrls: ['./add-loan.css']
})
export class AddLoan implements OnInit {
  loanForm!: FormGroup;
  isLoading = false;
  showSuccess = false;
  showError = false;
  successMessage = '';
  errorMessage = '';
  availableItems: any[] = [];

  constructor(
    private fb: FormBuilder,
    private ioanService: IoanService,
    private inventoryService: InventoryService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadAvailableItems();
  }

  initializeForm() {
    this.loanForm = this.fb.group({
      nombre_persona: ['', [Validators.required, Validators.minLength(3)]],
      item_id: ['', [Validators.required]],
      fecha_devolucion: [null]
    });
  }

  loadAvailableItems() {
    this.inventoryService.getElectronicComponent().subscribe({
      next: (items) => {
        this.availableItems = items;
      },
      error: (error) => {
        console.error('Error al cargar items:', error);
      }
    });
  }

  onSubmit() {
    if (this.loanForm.valid) {
      this.isLoading = true;
      
      const formValue = this.loanForm.value;
      const loanData: IoanPeticion = {
        nombre_persona: formValue.nombre_persona,
        item_id: Number(formValue.item_id),
        fecha_devolucion: formValue.fecha_devolucion || null
      };

      console.log("Datos del préstamo a enviar:", loanData);

      this.ioanService.createLoan(loanData).subscribe({
        next: (response: LoanDTO) => {
          console.log("Respuesta del servidor:", response);
          this.isLoading = false;
          this.showSuccess = true;
          this.successMessage = 'Préstamo creado exitosamente';
          this.resetForm();
        },
        error: (error) => {
          console.error("Error completo:", error);
          this.isLoading = false;
          this.showError = true;
          this.errorMessage = `Error al crear el préstamo: ${error.error?.message || error.message}`;
        }
      });
    } else {
      Object.keys(this.loanForm.controls).forEach(key => {
        this.loanForm.get(key)?.markAsTouched();
      });
    }
  }

  resetForm() {
    this.loanForm.reset();
    this.hideMessages();
  }

  hideMessages() {
    this.showSuccess = false;
    this.showError = false;
  }
}
