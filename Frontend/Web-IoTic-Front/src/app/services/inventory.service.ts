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

  getElectronicComponent(): Observable<ItemDTO[]> {
    return this.http.get<ItemDTO[]>(`${this.config.apiUrlBackend}inventario/items`).pipe(
      catchError(error => {
        console.error('Error al obtener componentes:', error);
        return throwError(() => error);
      })
    );
  }

  addElectronicComponent(device: ItemDTOPeticion): Observable<ItemDTO> {
    console.log("Item a guardar: ", device);
    return this.http.post<ItemDTO>(`${this.config.apiUrlBackend}inventario/items/masivo/`, device).pipe(
      catchError(error => {
        console.error('Error al agregar componente:', error);
        return throwError(() => error);
      })
    );
  }

  updateElectronicComponent(id: number, updatedElectronicComponent: ItemDTOPeticion): Observable<ItemDTO> {
    return this.http.put<ItemDTO>(`${this.config.apiUrlBackend}inventario/items/${id}/`, updatedElectronicComponent).pipe(
      catchError(error => {
        console.error('Error al actualizar componente:', error);
        return throwError(() => error);
      })
    );
  }

  deleteElectronicComponent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.config.apiUrlBackend}inventario/items/${id}/`).pipe(
      catchError(error => {
        console.error('Error al eliminar componente:', error);
        return throwError(() => error);
      })
    );
  }

  getElectronicComponentById(id: number): Observable<ItemDTO> {
    return this.http.get<ItemDTO>(`${this.config.apiUrlBackend}inventario/items/`+ id).pipe(
      catchError(error => {
        console.error('Error al obtener componente por ID:', error);
        return throwError(() => error);
      })
    );
  }
}