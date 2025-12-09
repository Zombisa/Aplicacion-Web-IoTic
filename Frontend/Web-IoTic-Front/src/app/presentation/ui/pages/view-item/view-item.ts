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
import { LoanDTOConsultById } from '../../../../models/DTO/LoanDTOConsultById';
import { LoanDTO } from '../../../../models/DTO/LoanDTO';
import { SectionInfoItem } from '../../templates/section-info-item/section-info-item';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-item',
  imports: [CommonModule, Header, LoadingPage,SectionInfoItem, ConfirmationModal],
  templateUrl: './view-item.html',
  styleUrl: './view-item.css'
})
export class ViewItem implements OnInit {

  private itemId!: number;  
  public item!: ItemDTO;
  public showDeleteModal = false;
  public loanData?: LoanDTO;
  public itemImageUrl: string = 'assets/img/item-placeholder.svg';
  private isDeleting = false;

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
        const posibleImagen = this.item.image_r2;

        this.itemImageUrl =
          posibleImagen && posibleImagen.trim() !== ''
            ? posibleImagen
            : 'assets/img/item-placeholder.svg';

        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener el item:', error);
        this.loadingService.hide();
        Swal.fire(
          'Error',
          'No se pudo cargar la información del ítem.',
          'error'
        );
      }
    })  
    
  };
  getLoanDataById(): void { 
    console.log('Obteniendo el préstamo activo del item con ID:', this.itemId);
    this.loanService.getActiveLoanByItemId(this.itemId).subscribe({
      next: (loanData) => {
        if (loanData) {
          this.loanData = loanData;
          console.log('Préstamo activo obtenido:', this.loanData);
        } else {
          console.log('No hay préstamo activo para este item');
          this.loanData = undefined;
        }
      },
      error: (error) => {
        console.error('Error al obtener el préstamo:', error);
        this.loanData = undefined;
      }
    })  
  };

  handlerFunctionEmitter(action: string): void {
    switch (action) {
      case 'edit':
        console.log('Acción de edición recibida para el item:', action);
        this.goToEdit();
        break;
      case 'delete':
        this.confirmDelete();
        break;
      case 'loan':
        this.goToLoan();
        break;
      case 'viewLoan':
        this.goToViewLoan();
        break;
      default:
        console.warn('Acción no reconocida:', action);
    }
  }
  /**
   * Navegar a la página de edición del item
   */
  goToEdit(): void{
    this.router.navigate(['inventario/edit-item', this.itemId]);
  }
  
  goToLoan(): void{
    this.router.navigate(['inventario/add-loan', this.itemId]);
  }
  goToViewLoan(): void{
    // Verificar si hay un préstamo activo antes de navegar
    if (this.loanData?.id) {
      this.router.navigate(['prestamos/pretamo', this.loanData.id]);
    } else {
      // Si no hay préstamo activo, intentar obtenerlo primero
      this.loadingService.show();
      this.loanService.getActiveLoanByItemId(this.itemId).subscribe({
        next: (loan) => {
          this.loadingService.hide();
          if (loan?.id) {
            this.loanData = loan;
            this.router.navigate(['prestamos/pretamo', loan.id]);
          } else {
            console.warn('No hay préstamo activo para este item');
            // Opcional: mostrar un mensaje al usuario
          }
        },
        error: (error) => {
          this.loadingService.hide();
          console.error('Error al obtener el préstamo activo:', error);
          // Opcional: mostrar un mensaje al usuario
        }
      });
    }
  }
  
  /**
   * Mostrar modal de confirmación para eliminar item
   */
  confirmDelete(): void {
    console.log('Mostrando modal de confirmación de eliminación');
    this.showDeleteModal = true;
  }
  
  /**
   * Ejecutar eliminación del item tras confirmación
   */
    onDeleteConfirmed(): void {
    if (this.isDeleting) {
      console.warn('Eliminación ya en proceso, ignorando llamada duplicada');
      return;
    }

    this.isDeleting = true;
    this.showDeleteModal = false; 

    this.loadingService.show();
    console.log('Eliminando item con ID:', this.itemId);
    
    this.inventoryService.deleteElectronicComponent(this.itemId).subscribe({
      next: () => {
        console.log('Item eliminado exitosamente');
        this.loadingService.hide();
        this.isDeleting = false;

        Swal.fire(
          'Eliminado',
          'El ítem se eliminó correctamente.',
          'success'
        ).then(() => {
          this.router.navigate(['/inventario']);
        });
      },
      error: (error) => {
        console.error('Error al eliminar el item:', error);
        this.loadingService.hide();
        this.isDeleting = false;
        
        const msgBackend =
          error?.error?.detail ||
          error?.error?.message ||
          'El ítem no puede ser eliminado en su estado actual.';

        Swal.fire('No se pudo eliminar', msgBackend, 'error');
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
