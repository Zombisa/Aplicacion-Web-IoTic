import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit } from '@angular/core';
import { ItemDTOPeticion } from '../../../../models/Peticion/ItemDTOPeticion';
import { InventoryService } from '../../../../services/inventory.service';
import { AuthService } from '../../../../services/auth.service';
import { Header } from '../../templates/header/header';
import { FormItem } from '../../templates/form-item/form-item';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-item',
  imports: [CommonModule, Header, FormItem],
  templateUrl: './add-item.html',
  styleUrl: './add-item.css'
})
export class AddItem implements OnInit {
  @ViewChild('itemFormComponent') itemFormComponent!: FormItem;

  isLoading = false;
  showSuccess = false;
  showError = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private inventoryService: InventoryService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    // Debug temporal para verificar autenticación
    await this.authService.debugAuthState();
  }

  /**
   * Se encarga de manejar el evento submitted emitido por el componente hijo FormItem
   * @param itemData Datos del item a agregar traídos desde el hijo FormItem
   */
  handleSubmit(event: {itemDTOPeticion: ItemDTOPeticion, file: File}){
    this.isLoading = true;
    this.hideMessages();

    console.log(" Enviando item:", JSON.stringify(event.itemDTOPeticion, null, 2));

    this.inventoryService.addElectronicComponent(event.itemDTOPeticion).subscribe({
      next: (response) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Item agregado exitosamente',
          text: `El item con ID ${response.id} ha sido agregado.`,
          confirmButtonText: 'Aceptar'
        });
        this.itemFormComponent.resetForm();
      },
      error: (error) => {
        console.error(" Error completo:", error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error al agregar item',
          text: `Ocurrió un error al agregar el item: ${error.message || error}`,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  hideMessages() {
    this.showSuccess = false;
    this.showError = false;
    this.successMessage = '';
    this.errorMessage = '';
  }
}
