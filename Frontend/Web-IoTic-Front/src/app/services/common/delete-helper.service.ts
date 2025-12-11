import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { LoadingService } from '../loading.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class DeleteHelperService {
  constructor(
    private loadingService: LoadingService,
    private router: Router
  ) {}

  /**
   * Función general para eliminar cualquier publicación
   * @param deleteObservable Observable que ejecuta la eliminación
   * @param itemId ID del item a eliminar (para logging)
   * @param itemName Nombre del tipo de item (para mensajes)
   * @param redirectPath Ruta a la que redirigir después de eliminar (default: '/productividad')
   * @returns Promise que se resuelve cuando la eliminación se completa
   */
  deleteItem(
    deleteObservable: Observable<void>,
    itemId: number,
    itemName: string = 'publicación',
    redirectPath: string = '/productividad'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loadingService.show();
      console.log(`Eliminando ${itemName} con ID:`, itemId);

      deleteObservable.subscribe({
        next: () => {
          console.log(`${itemName} eliminado exitosamente`);
          this.loadingService.hide();

          Swal.fire(
            'Eliminado',
            `La ${itemName} se eliminó correctamente.`,
            'success'
          ).then(() => {
            this.router.navigate([redirectPath]);
            resolve();
          });
        },
        error: (error) => {
          console.error(`Error al eliminar la ${itemName}:`, error);
          this.loadingService.hide();

          let msgBackend = `La ${itemName} no puede ser eliminada en su estado actual.`;
          
          if (error?.error) {
            // Intentar obtener el mensaje de error del backend
            if (typeof error.error === 'string') {
              msgBackend = error.error;
            } else if (error.error.detail) {
              msgBackend = error.error.detail;
            } else if (error.error.message) {
              msgBackend = error.error.message;
            } else if (error.error.error) {
              msgBackend = error.error.error;
            }
          } else if (error?.message) {
            msgBackend = error.message;
          }

          // Mostrar error más específico según el código HTTP
          if (error?.status === 403) {
            msgBackend = 'No tienes permisos para eliminar esta publicación.';
          } else if (error?.status === 404) {
            msgBackend = `${itemName.charAt(0).toUpperCase() + itemName.slice(1)} no encontrado.`;
          } else if (error?.status === 401) {
            msgBackend = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          }

          Swal.fire('No se pudo eliminar', msgBackend, 'error');
          reject(error);
        }
      });
    });
  }
}

