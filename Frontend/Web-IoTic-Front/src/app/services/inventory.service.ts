import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, from, map, retry, switchMap, throwError, timer } from 'rxjs';
import { environment } from '../environment/environment';
import { AuthService } from './auth.service';
import { ItemDTO } from '../models/DTO/ItemDTO';
import { ItemDTOPeticion } from '../models/Peticion/ItemDTOPeticion';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private apiUrl = 'http://localhost:8000/api/';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 segundo

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}
  private getAuthHeaders(): Observable<HttpHeaders> {
    return from(this.authService.getToken()).pipe(
      // Reintentar 3 veces antes de fallar
      retry({
        count: this.MAX_RETRIES,
        delay: (error, retryCount) => {
          console.warn(`Intento ${retryCount + 1}/${this.MAX_RETRIES} para obtener token...`);
          return timer(this.RETRY_DELAY);
        }
      }),
      // Validar que el token exista
      map(token => {
        if (!token || token.trim() === '') {
          throw new Error('Token de autenticación vacío o inválido');
        }
        
        return new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
      }),
      // Manejo de errores final
      catchError(error => {
        console.error('Error crítico al obtener headers de autenticación:', error);
        return throwError(() => new Error('No se pudo obtener autenticación después de varios intentos. Por favor, inicia sesión nuevamente.'));
      })
    );
  }
  getElectronicComponent(): Observable<ItemDTO[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.get<ItemDTO[]>(`${this.apiUrl}inventario/items`, { headers })
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
        console.log("itema a guardar: " + device);
        return this.http.post<ItemDTO>(`${this.apiUrl}inventario/items/masivo/`, device, { headers });
      }),
      catchError(error => {
        console.error('Error al agregar componente:', error);
        return throwError(() => error);
      })
    );
  }

  updateElectronicComponent(id: number, updatedElectronicComponent: ItemDTOPeticion): Observable<ItemDTO> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.put<ItemDTO>(`${this.apiUrl}inventario/inventario/${id}/`, updatedElectronicComponent, { headers });
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
  getElectronicComponentById(id: number): Observable<ItemDTO> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.get<ItemDTO>(`${this.apiUrl}inventario/items/`+ id, { headers })
      ),
      catchError(error => {
        console.error('Error al obtener componente por ID:', error);
        return throwError(() => error);
      })
    );
  }
}