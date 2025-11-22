import { Component, ViewChild } from '@angular/core';
import { ItemDTO } from '../../../../models/DTO/ItemDTO';
import { InventoryService } from '../../../../services/inventory.service';
import { FormItem } from '../../templates/form-item/form-item';
import { ItemDTOPeticion } from '../../../../models/Peticion/ItemDTOPeticion';
import { CommonModule } from '@angular/common';
import { Header } from '../../templates/header/header';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.html',
  styleUrls: ['./add-item.css'],
  imports: [FormItem, CommonModule, Header]
})
export class AddItem {
  @ViewChild('itemFormComponent') itemFormComponent!: FormItem;

  isLoading = false;
  showSuccess = false;
  showError = false;
  successMessage = '';
  errorMessage = '';

  constructor(private inventoryService: InventoryService) {}
  /**
   * Se encarga de manejar el evento submitted emitido por el componente hijo FormItem guardando el item
   * @param itemData Datos del item a agregar traidos desde el hijo FormItem por medio del evento submitted
   */
  handleSubmit(itemData: ItemDTOPeticion) {
    this.isLoading = true;
    this.showSuccess = false;
    this.showError = false;

    this.inventoryService.addElectronicComponent(itemData).subscribe({
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

  hideMessages() {
    this.showSuccess = false;
    this.showError = false;
  }
}
