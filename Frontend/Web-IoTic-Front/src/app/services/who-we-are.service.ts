import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, from, map, Observable, switchMap, throwError, of } from 'rxjs';
import { MisionDTO } from '../models/DTO/MisionDTO';
import { VisionDTO } from '../models/DTO/VisionDTO';
import { HistoriaDTO } from '../models/DTO/HistoriaDTO';
import { ObjetivoDTO } from '../models/DTO/ObjetivoDTO';
import { ValorDTO } from '../models/DTO/ValorDTO';

@Injectable({
  providedIn: 'root'
})
export class WhoWeAreService {
  private apiUrl = 'http://localhost:8000/api/informacion/';

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

  createMision(contenido: string): Observable<MisionDTO> {
    return this.getAuthHeaders().pipe(
      switchMap(headers =>
        this.http.post<MisionDTO>(`${this.apiUrl}mision/agregar/`, { contenido }, { headers })
      ),
      catchError(error => {
        console.error('Error al crear misión:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener Misión (público)
   */
  getMision(): Observable<MisionDTO | null> {
    return this.http.get<any>(`${this.apiUrl}mision/ver/`).pipe(
      map(response => {
        // Si el backend devuelve un mensaje, retornar null
        if (response && response.message) {
          return null;
        }
        return response as MisionDTO;
      }),
      catchError(error => {
        console.error('Error al obtener misión:', error);
        return throwError(() => error);
      })
    );
  }

    /**
   * Crear Visión 
   */
    createVision(contenido: string): Observable<VisionDTO> {
      return this.getAuthHeaders().pipe(
        switchMap(headers =>
          this.http.post<VisionDTO>(`${this.apiUrl}vision/agregar/`, { contenido }, { headers })
        ),
        catchError(error => {
          console.error('Error al crear visión:', error);
          return throwError(() => error);
        })
      );
    }

  /**
   * Actualizar Misión 
   */
  updateMision(id: number, contenido: string): Observable<MisionDTO> {
    return this.getAuthHeaders().pipe(
      switchMap(headers =>
        this.http.put<MisionDTO>(`${this.apiUrl}mision/${id}/editar/`, { contenido }, { headers })
      ),
      catchError(error => {
        console.error('Error al actualizar misión:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener Visión 
   */
  getVision(): Observable<VisionDTO | null> {
    return this.http.get<any>(`${this.apiUrl}vision/ver/`).pipe(
      map(response => {
        // Si el backend devuelve un mensaje, retornar null
        if (response && response.message) {
          return null;
        }
        return response as VisionDTO;
      }),
      catchError(error => {
        console.error('Error al obtener visión:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualizar Visión 
   */
  updateVision(id: number, contenido: string): Observable<VisionDTO> {
    return this.getAuthHeaders().pipe(
      switchMap(headers =>
        this.http.put<VisionDTO>(`${this.apiUrl}vision/${id}/editar/`, { contenido }, { headers })
      ),
      catchError(error => {
        console.error('Error al actualizar visión:', error);
        return throwError(() => error);
      })
    );
  }
  /**
   * Crear Historia 
   */
  createHistoria(contenido: string): Observable<HistoriaDTO> {
    return this.getAuthHeaders().pipe(
      switchMap(headers =>
        this.http.post<HistoriaDTO>(`${this.apiUrl}historia/agregar/`, { contenido }, { headers })
      ),
      catchError(error => {
        console.error('Error al crear historia:', error);
        return throwError(() => error);
      })
    );
  }
  /**
   * Obtener Historia 
   */
  getHistoria(): Observable<HistoriaDTO | null> {
    return this.http.get<any>(`${this.apiUrl}historia/ver/`).pipe(
      map(response => {
        // Si el backend devuelve un mensaje, retornar null
        if (response && response.message) {
          return null;
        }
        return response as HistoriaDTO;
      }),
      catchError(error => {
        console.error('Error al obtener historia:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualizar Historia 
   */
  updateHistoria(id: number, contenido: string): Observable<HistoriaDTO> {
    return this.getAuthHeaders().pipe(
      switchMap(headers =>
        this.http.put<HistoriaDTO>(`${this.apiUrl}historia/${id}/editar/`, { contenido }, { headers })
      ),
      catchError(error => {
        console.error('Error al actualizar historia:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener Objetivos 
   */
  getObjetivos(): Observable<ObjetivoDTO[]> {
    return this.http.get<ObjetivoDTO[]>(`${this.apiUrl}objetivos/ver/`).pipe(
      catchError(error => {
        console.error('Error al obtener objetivos:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crear Objetivo 
   */
  createObjetivo(titulo: string, contenido: string): Observable<ObjetivoDTO> {
    return this.getAuthHeaders().pipe(
      switchMap(headers =>
        this.http.post<ObjetivoDTO>(`${this.apiUrl}objetivos/agregar/`, { titulo, contenido }, { headers })
      ),
      catchError(error => {
        console.error('Error al crear objetivo:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualizar Objetivo 
   */
  updateObjetivo(id: number, titulo: string, contenido: string): Observable<ObjetivoDTO> {
    return this.getAuthHeaders().pipe(
      switchMap(headers =>
        this.http.put<ObjetivoDTO>(`${this.apiUrl}objetivos/${id}/editar/`, { titulo, contenido }, { headers })
      ),
      catchError(error => {
        console.error('Error al actualizar objetivo:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Eliminar Objetivo 
   */
  deleteObjetivo(id: number): Observable<void> {
    return this.getAuthHeaders().pipe(
      switchMap(headers =>
        this.http.delete<void>(`${this.apiUrl}objetivos/${id}/eliminar/`, { headers })
      ),
      catchError(error => {
        console.error('Error al eliminar objetivo:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener Valores
   */
  getValores(): Observable<ValorDTO[]> {
    return this.http.get<ValorDTO[]>(`${this.apiUrl}valores/ver/`).pipe(
      catchError(error => {
        console.error('Error al obtener valores:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crear Valor 
   */
  createValor(titulo: string, contenido: string): Observable<ValorDTO> {
    return this.getAuthHeaders().pipe(
      switchMap(headers =>
        this.http.post<ValorDTO>(`${this.apiUrl}valores/agregar/`, { titulo, contenido }, { headers })
      ),
      catchError(error => {
        console.error('Error al crear valor:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualizar Valor 
   */
  updateValor(id: number, titulo: string, contenido: string): Observable<ValorDTO> {
    return this.getAuthHeaders().pipe(
      switchMap(headers =>
        this.http.put<ValorDTO>(`${this.apiUrl}valores/${id}/editar/`, { titulo, contenido }, { headers })
      ),
      catchError(error => {
        console.error('Error al actualizar valor:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Eliminar Valor 
   */
  deleteValor(id: number): Observable<void> {
    return this.getAuthHeaders().pipe(
      switchMap(headers =>
        this.http.delete<void>(`${this.apiUrl}valores/${id}/eliminar/`, { headers })
      ),
      catchError(error => {
        console.error('Error al eliminar valor:', error);
        return throwError(() => error);
      })
    );
  }
}

