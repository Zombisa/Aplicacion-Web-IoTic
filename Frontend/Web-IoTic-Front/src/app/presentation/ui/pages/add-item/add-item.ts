import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit } from '@angular/core';
import { ItemDTOPeticion } from '../../../../models/Peticion/ItemDTOPeticion';
import { InventoryService } from '../../../../services/inventory.service';
import { AuthService } from '../../../../services/auth.service';
import { Header } from '../../templates/header/header';
import { FormItem } from '../../templates/form-item/form-item';

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
  handleSubmit(itemData: ItemDTOPeticion) {
    this.isLoading = true;
    this.hideMessages();

    console.log("📤 Enviando item:", JSON.stringify(itemData, null, 2));

    this.inventoryService.addElectronicComponent(itemData).subscribe({
      next: (response) => {
        console.log("✅ Respuesta del servidor:", response);
        this.isLoading = false;
        this.showSuccess = true;
        this.successMessage = 'Item agregado exitosamente';

        // Resetear formulario después del éxito
        this.itemFormComponent.resetForm();

        // Auto-ocultar mensaje después de 5 segundos
        setTimeout(() => {
          this.hideMessages();
        }, 5000);
      },
      error: (error) => {
        console.error("❌ Error completo:", error);
        this.isLoading = false;
        this.showError = true;
        
        // Mejorar el mensaje de error
        if (error.status === 401) {
          this.errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 400) {
          this.errorMessage = `Datos inválidos: ${error.error?.message || 'Verifica los campos'}`;
        } else if (error.status === 500) {
          this.errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
        } else {
          this.errorMessage = `Error al agregar el item: ${error.error?.message || error.message}`;
        }

        // Auto-ocultar mensaje de error después de 8 segundos
        setTimeout(() => {
          this.hideMessages();
        }, 8000);
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
