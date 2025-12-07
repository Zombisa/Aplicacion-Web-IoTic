import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Header } from '../../templates/header/header';
import { ActivatedRoute, Router } from '@angular/router';
import { LoanService } from '../../../../services/Loan.service';
import { LoanDTOConsultById } from '../../../../models/DTO/LoanDTOConsultById';
import { ItemDTO } from '../../../../models/DTO/ItemDTO';
import { InventoryService } from '../../../../services/inventory.service';
import { LoadingService } from '../../../../services/loading.service';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { SectionInfoLoan } from '../../templates/section-info-loan/section-info-loan';
import { SectionInfoItem } from '../../templates/section-info-item/section-info-item';
import { ConfirmationModal } from '../../templates/confirmation-modal/confirmation-modal';

@Component({
  selector: 'app-view-loan-item',
  imports: [
    CommonModule, 
    Header, 
    LoadingPage, 
    SectionInfoLoan, 
    SectionInfoItem,
    ConfirmationModal
  ],
  templateUrl: './view-loan-item.html',
  styleUrl: './view-loan-item.css'
})
export class ViewLoanItem implements OnInit {
  loanId!: number;
  loanData?: LoanDTOConsultById;
  item?: ItemDTO;
  showReturnModal = false;
  showError = false;
  errorMessage = '';
  itemLoadError = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loanService: LoanService,
    private inventoryService: InventoryService,
    public loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.loanId = Number(idParam);
        this.getLoanById();
      } else {
        this.showError = true;
        this.errorMessage = 'ID de préstamo no proporcionado en la URL.';
      }
    });
  }

  /**
   * Obtener el préstamo por ID
   */
  getLoanById(): void {
    this.loadingService.show();
    this.loanService.getLoanById(this.loanId).subscribe({
      next: (loan) => {
        this.loanData = loan;
        console.log('Préstamo obtenido:', this.loanData);
        console.log('Item en el préstamo:', loan.item);
        console.log('Tipo de item:', typeof loan.item);
        
        // El backend puede devolver el item como objeto completo o como ID
        if (loan.item) {
          if (typeof loan.item === 'number') {
            // Si es un número, obtener el item por ID
            this.getItemById(loan.item);
          } else if (typeof loan.item === 'object' && loan.item !== null) {
            // Si es un objeto, usarlo directamente
            this.item = loan.item as ItemDTO;
            console.log('Item obtenido directamente del préstamo:', this.item);
            this.loadingService.hide();
          } else {
            console.warn('El item no es ni número ni objeto válido:', loan.item);
            this.loadingService.hide();
          }
        } else {
          console.warn('El préstamo no tiene un item asociado');
          this.loadingService.hide();
        }
      },
      error: (error) => {
        console.error('Error al obtener el préstamo:', error);
        this.showError = true;
        this.errorMessage = 'Error al cargar la información del préstamo.';
        this.loadingService.hide();
      }
    });
  }

  /**
   * Obtener el item por ID
   */
  getItemById(itemId: number): void {
    console.log('Obteniendo item con ID:', itemId);
    this.itemLoadError = false;
    
    if (!itemId || isNaN(itemId)) {
      console.error('ID de item inválido:', itemId);
      this.itemLoadError = true;
      this.loadingService.hide();
      return;
    }
    
    this.inventoryService.getElectronicComponentById(itemId).subscribe({
      next: (item) => {
        this.item = item;
        this.itemLoadError = false;
        console.log('Item obtenido exitosamente:', this.item);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener el item:', error);
        console.error('Status:', error.status);
        console.error('Error completo:', error);
        this.item = undefined;
        this.itemLoadError = true;
        this.loadingService.hide();
      }
    });
  }

  /**
   * Manejar eventos del componente section-info-item
   */
  handlerFunctionEmitter(action: string): void {
    switch (action) {
      case 'return':
        this.confirmReturn();
        break;
      default:
        console.warn('Acción no reconocida:', action);
    }
  }

  /**
   * Mostrar modal de confirmación para devolver el préstamo
   */
  confirmReturn(): void {
    this.showReturnModal = true;
  }

  /**
   * Ejecutar devolución del préstamo tras confirmación
   */
  onReturnConfirmed(): void {
    if (!this.loanData?.id) {
      return;
    }

    this.loadingService.show();
    this.loanService.returnLoan(this.loanData.id).subscribe({
      next: (updatedLoan) => {
        console.log('Préstamo devuelto exitosamente:', updatedLoan);
        this.loadingService.hide();
        this.showReturnModal = false;
        // Recargar los datos del préstamo
        this.getLoanById();
        // Opcional: navegar de vuelta a la lista de préstamos
        // this.router.navigate(['/inventario/history']);
      },
      error: (error) => {
        console.error('Error al devolver el préstamo:', error);
        this.loadingService.hide();
        this.showReturnModal = false;
        this.showError = true;
        this.errorMessage = 'Error al devolver el préstamo. Por favor, intente nuevamente.';
      }
    });
  }

  /**
   * Cancelar devolución del préstamo
   */
  onReturnCancelled(): void {
    this.showReturnModal = false;
  }
}
