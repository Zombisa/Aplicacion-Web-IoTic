import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environment/environment';
import { ItemDTO } from '../models/DTO/ItemDTO';
import { ItemDTOPeticion } from '../models/Peticion/ItemDTOPeticion';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private apiUrl = 'http://localhost:8000/api/';

  constructor(private http: HttpClient) {}

  getElectronicComponent(): Observable<ItemDTO[]> {
    return this.http.get<ItemDTO[]>(`${this.apiUrl}inventario/items`).pipe(
      catchError(error => {
        console.error('Error al obtener componentes:', error);
        return throwError(() => error);
      })
    );
  }

  addElectronicComponent(device: ItemDTOPeticion): Observable<ItemDTO> {
    console.log("Item a guardar: ", device);
    return this.http.post<ItemDTO>(`${this.apiUrl}inventario/items/masivo/`, device).pipe(
      catchError(error => {
        console.error('Error al agregar componente:', error);
        return throwError(() => error);
      })
    );
  }

  updateElectronicComponent(id: number, updatedElectronicComponent: ItemDTOPeticion): Observable<ItemDTO> {
    return this.http.put<ItemDTO>(`${this.apiUrl}inventario/items/${id}/`, updatedElectronicComponent).pipe(
      catchError(error => {
        console.error('Error al actualizar componente:', error);
        return throwError(() => error);
      })
    );
  }

  deleteElectronicComponent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}inventario/items/${id}/`).pipe(
      catchError(error => {
        console.error('Error al eliminar componente:', error);
        return throwError(() => error);
      })
    );
  }

  getElectronicComponentById(id: number): Observable<ItemDTO> {
    return this.http.get<ItemDTO>(`${this.apiUrl}inventario/items/`+ id).pipe(
      catchError(error => {
        console.error('Error al obtener componente por ID:', error);
        return throwError(() => error);
      })
    );
  }
}