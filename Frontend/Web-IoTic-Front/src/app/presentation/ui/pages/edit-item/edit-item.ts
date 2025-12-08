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
import { ImagesService } from '../../../../services/common/images.service';
import { switchMap } from 'rxjs';


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
    private route: Router,
    private imageService: ImagesService
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
  async handleSubmit(event: {itemDTOPeticion: ItemDTOPeticion, file: File}) {
    const {  ...updateData } = event.itemDTOPeticion;
    if(!event.file){
      this.saveItem(updateData);
      return;
    }
    const compressedFile = await this.compressFile(event.file);
    await this.uploadAndSetImage(updateData, compressedFile);
    this.saveItem(updateData);
  }

  /**
   * 
   * @param file archivo a comprimir
   * @returns Archivo comprimido
   */
  private compressFile(file: File): Promise<File> {
    return this.imageService.compressImage(file, 0.7, 1500);
  }
  /**
     * funcion que sube la imagen comprimida a R2 y actualiza el objeto data con la ruta
     * @param data objeto de datos donde se colocara la ruta de la imagen subida
     * @param file imagen comprimida a subir
     * @returns 
     */
  private uploadAndSetImage(data: ItemDTOPeticion, file: File): Promise<void> {
    const extension = file.name.split('.').pop() || 'jpg';
    const contentType = file.type;

    return new Promise((resolve, reject) => {
      // Pasa file_path existente para sobrescribir
      this.imageService.getPresignedUrl(extension, data.file_path)
        .pipe(
          switchMap((resp) => {
            // Si es nuevo, asigna file_path devuelto por backend
            if (!data.file_path) {
              data.file_path = resp.file_path;
            }
            return this.imageService.uploadToR2(resp.upload_url, file);
          })
        )
        .subscribe({
          next: () => resolve(),
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error al subir la imagen',
              text: 'No se pudo subir la imagen. Por favor intenta nuevamente.',
              confirmButtonText: 'Aceptar'
            });
            reject(err);
          }
        });
    });
  }

  /**
   * Guarda el item en el backend
   * @param itemData Datos del item a guardar
   */
  private saveItem(itemData: ItemDTOPeticion): void {
    this.inventoryService.updateElectronicComponent(this.itemId, itemData).subscribe({
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
