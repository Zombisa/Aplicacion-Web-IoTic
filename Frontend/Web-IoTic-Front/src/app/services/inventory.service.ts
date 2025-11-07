import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, from, map, switchMap, throwError } from 'rxjs';
import { environment } from '../environment/environment';
import { ElectronicComponent } from '../models/electronicComponent.model';
import { AuthService } from './auth.service';
import { ItemDTO } from '../models/DTO/ItemDTO';
import { ItemDTOPeticion } from '../models/Peticion/ItemDTOPeticion';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private apiUrl = 'http://localhost:8000/api/';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}
  private getAuthHeaders(): Observable<HttpHeaders> {
    return from(this.authService.getToken()).pipe(
      map(token => {
        if (!token) {
          throw new Error('No se pudo obtener el token de autenticación');
        }
        return new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
      })
    );
  }

  getElectronicComponent(): Observable<ItemDTO[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.get<ItemDTO[]>(`${this.apiUrl}inventario/inventario/`, { headers })
      ),
      catchError(error => {
        console.error('Error al obtener componentes:', error);
        return throwError(() => error);
      })
    );
    }
addElectronicComponent(device: ItemDTOPeticion): Observable<ItemDTO> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        // Remover el id si existe (el backend lo asignará)
        return this.http.post<ItemDTO>(`${this.apiUrl}inventario/inventario/`, device, { headers });
      }),
      catchError(error => {
        console.error('Error al agregar componente:', error);
        return throwError(() => error);
      })
    );
  }

  updateElectronicComponent(id: number, updatedElectronicComponent: ElectronicComponent): Observable<ElectronicComponent> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        // Remover el id del objeto para evitar conflictos
        const { id: componentId, ...componentData } = updatedElectronicComponent;
        return this.http.put<ElectronicComponent>(`${this.apiUrl}inventario/inventario/${id}/`, componentData, { headers });
      }),
      catchError(error => {
        console.error('Error al actualizar componente:', error);
        return throwError(() => error);
      })
    );
  }

  deleteElectronicComponent(id: number): Observable<void> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.delete<void>(`${this.apiUrl}inventario/inventario/${id}/`, { headers })
      ),
      catchError(error => {
        console.error('Error al eliminar componente:', error);
        return throwError(() => error);
      })
    );
  }

  // Método adicional para obtener un componente específico por ID
  getElectronicComponentById(id: number): Observable<ElectronicComponent> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.get<ElectronicComponent>(`${this.apiUrl}inventario/inventario/${id}/`, { headers })
      ),
      catchError(error => {
        console.error('Error al obtener componente por ID:', error);
        return throwError(() => error);
      })
    );
  }
}