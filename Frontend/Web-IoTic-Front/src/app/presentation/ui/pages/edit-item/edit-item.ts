import { Component, OnChanges, ViewChild } from '@angular/core';
import { ItemDTOPeticion } from '../../../../models/Peticion/ItemDTOPeticion';
import { InventoryService } from '../../../../services/inventory.service';
import { FormItem } from '../../templates/form-item/form-item';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { LoadingService } from '../../../../services/loading.service';
import { ItemDTO } from '../../../../models/DTO/ItemDTO';
import { CommonModule } from '@angular/common';
import { Header } from '../../templates/header/header';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-edit-item',
  imports: [CommonModule, FormItem, Header],
  templateUrl: './edit-item.html',
  styleUrl: './edit-item.css'
})
export class EditItem {
 @ViewChild('itemFormComponent') itemFormComponent!: FormItem;

  successMessage = '';
  errorMessage = '';
  private itemId!: number;
  public item?: ItemDTO;

  constructor(private inventoryService: InventoryService,
    private activatedRoute: ActivatedRoute,
    private loadingService: LoadingService,
    private route: Router
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
  handleSubmit(event: {itemDTOPeticion: ItemDTOPeticion, file: File}): void {
    const {  ...updateData } = event.itemDTOPeticion;
    this.inventoryService.updateElectronicComponent(this.itemId, event.itemDTOPeticion).subscribe({
      next: (response) => {
        console.log("Respuesta del servidor:", response);
        this.successMessage = 'Item agregado exitosamente';
        this.itemFormComponent.resetForm();
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'El item ha sido actualizado exitosamente.',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.route.navigate(['/inventario']);
        });
      },
      error: (error) => {
        console.error("Error completo:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al actualizar el item. Por favor, intenta nuevamente.',
          confirmButtonText: 'Aceptar'
        });
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

}
