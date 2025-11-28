import { Component, Input, OnInit } from '@angular/core';
import { LoanService } from '../../../../services/Loan.service';
import { CommonModule } from '@angular/common';
import { Header } from '../../templates/header/header';
import { ItemDTO } from '../../../../models/DTO/ItemDTO';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from '../../../../services/inventory.service';
import { LoadingService } from '../../../../services/loading.service';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { ConfirmationModal } from '../../templates/confirmation-modal/confirmation-modal';
import { BlockViewPersonLoan } from '../../templates/block-view-person-loan/block-view-person-loan';
import { LoanDTOConsultById } from '../../../../models/DTO/LoanDTOConsultById';

@Component({
  selector: 'app-view-item',
  imports: [CommonModule, Header, LoadingPage, ConfirmationModal, BlockViewPersonLoan],
  templateUrl: './view-item.html',
  styleUrl: './view-item.css'
})
export class ViewItem implements OnInit {

  private itemId!: number;  
  public item?: ItemDTO;
  public showDeleteModal = false;
  public loanData?: LoanDTOConsultById;

  constructor(
    private inventoryService: InventoryService,
    private activatedRoute: ActivatedRoute,
    public loadingService: LoadingService,
    private loanService: LoanService,
    private router: Router
  ) {}
  /**
   * Inicialización del componente
   * Obtiene el id de la url
   */
  ngOnInit(): void {
    
    this.activatedRoute.paramMap.subscribe(params => {
      this.itemId = Number(params.get('id'));
      console.log('ID del item obtenido de la URL:', this.itemId);
      this.getItemById();
      this.getLoanDataById();
    });
  }

  /**
   * Obtener el item por ID
   * @Returns void no retorna el item pero si lo guarda dentro de la variable del componente
   */
  getItemById(): void {
    this.loadingService.show();
    console.log('Obteniendo el item con ID:', this.itemId);
    this.inventoryService.getElectronicComponentById(this.itemId).subscribe({
      next: (item) => {
        this.item = item;
        console.log('Item obtenido:', this.item);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener el item:', error);
      }
    })  
    
  };
  getLoanDataById(): void { 
    this.loadingService.show();
    console.log('Obteniendo el préstamo del item con ID:', this.itemId);
    this.loanService.getLoanById(this.itemId).subscribe({
      next: (loanData) => {
        this.loanData = loanData;
        console.log('Préstamo obtenido:', this.loanData);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener el préstamo:', error);
      }
    })  
  };
  /**
   * Navegar a la página de edición del item
   */
  goToEdit(): void{
    console.log('Navegando a la página de edición del item con ID:', this.itemId);
    this.router.navigate(['inventario/edit-item', this.itemId]);
  }
  
  goToLoan(): void{
    console.log('Navegando a la página de préstamo del item con ID:', this.itemId);
    this.router.navigate(['inventario/add-loan', this.itemId]);
  }
  
  /**
   * Mostrar modal de confirmación para eliminar item
   */
  confirmDelete(): void {
    this.showDeleteModal = true;
  }
  
  /**
   * Ejecutar eliminación del item tras confirmación
   */
  onDeleteConfirmed(): void {
    this.loadingService.show();
    console.log('Eliminando item con ID:', this.itemId);
    
    this.inventoryService.deleteElectronicComponent(this.itemId).subscribe({
      next: () => {
        console.log('Item eliminado exitosamente');
        this.loadingService.hide();
        this.router.navigate(['/inventario']);
      },
      error: (error) => {
        console.error('Error al eliminar el item:', error);
        this.loadingService.hide();
        // TODO: Mostrar mensaje de error al usuario
      }
    });  
  }
  
  /**
   * Cancelar eliminación del item
   */
  onDeleteCancelled(): void {
    this.showDeleteModal = false;
    console.log('Eliminación cancelada');
  }
}
