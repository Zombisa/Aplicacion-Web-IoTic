import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environment/environment';
import { ItemDTO } from '../models/DTO/ItemDTO';
import { ItemDTOPeticion } from '../models/Peticion/ItemDTOPeticion';
import { AppConfigService } from './common/app-config.service';

@Injectable({ providedIn: 'root' })
export class InventoryService {


  constructor(private http: HttpClient, private config: AppConfigService) {}

  /**
   * Consulta la lista de del invetario disponibles en el inventario.
   * @returns Observable<ItemDTO[]> Lista de componentes electrónicos
   */

  getElectronicComponent(): Observable<ItemDTO[]> {
    return this.http.get<ItemDTO[]>(`${this.config.apiUrlBackend}inventario/items`).pipe(
      catchError(error => {
        console.error('Error al obtener componentes:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Agrega un nuevo componente electrónico al inventario.
   * @param device Componente electrónico a agregar
   * @returns el componente electrónico agregado
   */

  addElectronicComponent(device: ItemDTOPeticion): Observable<ItemDTO> {
    console.log("Item a guardar: ", device);
    return this.http.post<ItemDTO>(`${this.config.apiUrlBackend}inventario/items/bulk/`, device).pipe(
      catchError(error => {
        console.error('Error al agregar componente:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza un item existente en el inventario.
   * @param id Identificador del item a actualizar
   * @param updatedElectronicComponent item con los datos actualizados
   * @returns item actualizado en el backend
   */
  updateElectronicComponent(id: number, updatedElectronicComponent: ItemDTOPeticion): Observable<ItemDTO> {
    return this.http.put<ItemDTO>(`${this.config.apiUrlBackend}inventario/items/${id}/`, updatedElectronicComponent).pipe(
      catchError(error => {
        console.error('Error al actualizar componente:', error);
        return throwError(() => error);
      })
    );
  }
  /**
   * Elimina un item del inventario.
   * @param id Identificador del item a eliminar
   * @returns 
   */
  deleteElectronicComponent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.config.apiUrlBackend}inventario/items/${id}/`).pipe(
      catchError(error => {
        console.error('Error al eliminar componente:', error);
        return throwError(() => error);
      })
    );
  }
  /**
   * Consulta el item del inventario por su ID.
   * @param id Identificador del item a obtener
   * @returns item obtenido del inventario del id consultado
   */
  getElectronicComponentById(id: number): Observable<ItemDTO> {
    return this.http.get<ItemDTO>(`${this.config.apiUrlBackend}inventario/items/${id}/`).pipe(
      catchError(error => {
        console.error('Error al obtener componente por ID:', error);
        return throwError(() => error);
      })
    );
  }
  /**
   * Desactiva un item del inventario.
   * @param id Identificador del item a desactivar
   * @returns 
   */
  desactivateItem(id: number): Observable<void> {
    return this.http.patch<void>(`${this.config.apiUrlBackend}inventario/items/${id}/`, {}).pipe(
      catchError(error => {
        console.error('Error al desactivar componente:', error);
        return throwError(() => error);
      })
    );
  }
  /**
   * Elimina la imagen asociada a un item del inventario.
   * @returns 
   */
  deleteImageItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.config.apiUrlBackend}inventario/items/${id}/images/`).pipe(
      catchError(error => {
        console.error('Error al eliminar imagen del componente:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Consulta items dipsonibles en el inventario.
   * @returns Lista de itemns disponibles para prestar
   */
  getAvailableItems(): Observable<ItemDTO[]> {
    return this.http.get<ItemDTO[]>(`${this.config.apiUrlBackend}inventario/items/reports/available/`).pipe(
      catchError(error => {
        console.error('Error al obtener componentes disponibles:', error);
        return throwError(() => error);
      })
    );
  }
  /**
   * Consulta items prestados en el inventario.
   * @returns Lista de itemns no disponibles para prestar
   */
  getLoanedItems(): Observable<ItemDTO[]> {
    return this.http.get<ItemDTO[]>(`${this.config.apiUrlBackend}inventario/items/reports/loaned/`).pipe(
      catchError(error => {
        console.error('Error al obtener componentes prestados:', error);
        return throwError(() => error);
      })
    );
  }


}