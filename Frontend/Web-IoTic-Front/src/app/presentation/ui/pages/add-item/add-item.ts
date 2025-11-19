import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ItemDTOPeticion } from '../../../../models/Peticion/ItemDTOPeticion';
import { InventoryService } from '../../../../services/inventory.service';
import { Header } from '../../templates/header/header';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-item',
  imports: [CommonModule, Header, ReactiveFormsModule],
  templateUrl: './add-item.html',
  styleUrl: './add-item.css'
})
export class AddItem  implements OnInit{
itemForm!: FormGroup;
  isLoading = false;
  showSuccess = false;
  showError = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.itemForm = this.fb.group({
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      estado_fisico: ['', [Validators.required]],
      estado_admin: ['', [Validators.required]],
      observacion: [''],
      cantidad: ['', [Validators.required, Validators.min(1)]]
    });
  }

 onSubmit() {
  if (this.itemForm.valid) {
    this.isLoading = true;
    
   const formValue = this.itemForm.value;
    const itemData: ItemDTOPeticion = {
      ...formValue,
      observacion: formValue.observacion || '' // Garantizar string vacío
    };
    console.log("Datos a enviar:", JSON.stringify(itemData, null, 2));

    this.inventoryService.addElectronicComponent(itemData).subscribe({
      next: (response) => {
        console.log("Respuesta del servidor:", response);
        this.isLoading = false;
        this.showSuccess = true;
        this.successMessage = 'Item agregado exitosamente';
        this.resetForm();
      },
      error: (error) => {
        console.error("Error completo:", error);
        this.isLoading = false;
        this.showError = true;
        this.errorMessage = `Error al agregar el item: ${error.error?.message || error.message}`;
      }
    });
  } else {
    Object.keys(this.itemForm.controls).forEach(key => {
      this.itemForm.get(key)?.markAsTouched();
    });
  }
}

  resetForm() {
    this.itemForm.reset();
    this.hideMessages();
  }

  hideMessages() {
    this.showSuccess = false;
    this.showError = false;
  }
}
