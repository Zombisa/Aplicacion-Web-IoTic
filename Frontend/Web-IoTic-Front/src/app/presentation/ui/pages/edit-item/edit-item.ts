import { Component, OnChanges, ViewChild } from '@angular/core';
import { ItemDTOPeticion } from '../../../../models/Peticion/ItemDTOPeticion';
import { InventoryService } from '../../../../services/inventory.service';
import { FormItem } from '../../templates/form-item/form-item';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from '../../../../services/loading.service';
import { ItemDTO } from '../../../../models/DTO/ItemDTO';
import { CommonModule } from '@angular/common';
import { Header } from '../../templates/header/header';

@Component({
  selector: 'app-edit-item',
  imports: [CommonModule, FormItem, Header],
  templateUrl: './edit-item.html',
  styleUrl: './edit-item.css'
})
export class EditItem {
 @ViewChild('itemFormComponent') itemFormComponent!: FormItem;

  isLoading = false;
  showSuccess = false;
  showError = false;
  successMessage = '';
  errorMessage = '';
  private itemId!: number;
  public item?: ItemDTO;

  constructor(private inventoryService: InventoryService,
    private activatedRoute: ActivatedRoute,
    private loadingService: LoadingService
  ) {}
  
  ngOnInit(): void {
     this.activatedRoute.paramMap.subscribe(params => {
      this.itemId = Number(params.get('id'));
      console.log('ID del item obtenido de la URL:', this.itemId);
      this.getItemById();
    });
  }
  /**
   * Se encarga de manejar el evento submitted emitido por el componente hijo FormItem guardando el item
   * @param itemData Datos del item a agregar traidos desde el hijo FormItem por medio del evento submitted
   */
  handleSubmit(itemData: ItemDTOPeticion) {
    this.isLoading = true;
    this.showSuccess = false;
    this.showError = false;
    const {  ...updateData } = itemData;
    this.inventoryService.updateElectronicComponent(this.itemId, itemData).subscribe({
      next: (response) => {
        console.log("Respuesta del servidor:", response);
        this.isLoading = false;
        this.showSuccess = true;
        this.successMessage = 'Item agregado exitosamente';

        setTimeout(() => this.hideMessages(), 5000);
        this.itemFormComponent.resetForm();
      },
      error: (error) => {
        console.error("Error completo:", error);
        this.isLoading = false;
        this.showError = true;
        this.errorMessage = `Error al agregar el item: ${error.error?.message || error.message}`;
      }
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
  hideMessages() {
    this.showSuccess = false;
    this.showError = false;
  }
}
