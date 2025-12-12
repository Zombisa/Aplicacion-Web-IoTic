import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit } from '@angular/core';
import { ItemDTOPeticion } from '../../../../models/Peticion/ItemDTOPeticion';
import { InventoryService } from '../../../../services/inventory.service';
import { AuthService } from '../../../../services/auth.service';
import { Header } from '../../templates/header/header';
import { FormItem } from '../../templates/form-item/form-item';
import Swal from 'sweetalert2';
import { ImagesService } from '../../../../services/common/images.service';
import { switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { LoadingService } from '../../../../services/loading.service';
import { LoadingPage } from '../../components/loading-page/loading-page';

@Component({
  selector: 'app-add-item',
  imports: [CommonModule, Header, FormItem, LoadingPage],
  templateUrl: './add-item.html',
  styleUrl: './add-item.css'
})
export class AddItem {
  @ViewChild('itemFormComponent') itemFormComponent!: FormItem;

  errorMessage = '';

  constructor(
    private inventoryService: InventoryService,
    private authService: AuthService,
    private  imageService: ImagesService,
    private router: Router,
    public loadingService: LoadingService
  ) {}


  /**
   * Se encarga de manejar el evento submitted emitido por el componente hijo FormItem
   * @param itemData Datos del item a agregar traídos desde el hijo FormItem
   */
  async handleSubmit(event: {itemDTOPeticion: ItemDTOPeticion, file: File}){  
    if(!event.file){
      this.saveItemData(event.itemDTOPeticion);
      return;
    }
    try {

      const compressed = await this.compressFile(event.file);
      await this.uploadAndSetImage(event.itemDTOPeticion, compressed);
      this.saveItemData(event.itemDTOPeticion);
    }catch{}
    
  }
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
        this.imageService.getPresignedUrl(extension, contentType)
          .pipe(
            switchMap((resp) => {
              data.file_path= resp.file_path;
              return this.imageService.uploadToR2(resp.upload_url, file);
            })
          )
          .subscribe({
          next: () => resolve(),
            error: (err) => {
              // Mostrar notificación de error
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
   * Guarda los datos del item utilizando el servicio de inventario
   * @param item Datos del item a guardar
   */
  private saveItemData(item: ItemDTOPeticion): void {
    this.loadingService.show();
    this.inventoryService.addElectronicComponent(item).subscribe({
          next: (response) => {
            this.loadingService.hide();
            Swal.fire({
              icon: 'success',
              title: 'Item agregado exitosamente',
              text: `El item con ID ${response.id} ha sido agregado.`,
              confirmButtonText: 'Aceptar'
            });
            this.itemFormComponent.resetForm();
            this.loadingService.hide();
          },
          error: (error) => {
            
            console.error(" Error completo:", error);
            Swal.fire({
              icon: 'error',
              title: 'Error al agregar item',
              text: `Ocurrió un error al agregar el item: ${error.message || error}`,
              confirmButtonText: 'Aceptar'
            }).then(() => {
              
              this.router.navigate(['/inventario']);
            });
          }
        });
  }
}
