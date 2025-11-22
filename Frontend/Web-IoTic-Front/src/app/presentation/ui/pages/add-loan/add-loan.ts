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
import { FormPersonLoan } from '../../templates/form-person-loan/form-person-loan';

@Component({
  selector: 'app-add-loan',
  standalone: true,
  imports: [CommonModule, Header, FormPersonLoan],
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
    this.loadAvailableItems();
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

}
