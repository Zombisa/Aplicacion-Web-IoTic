import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, from, map, Observable, switchMap, throwError, of } from 'rxjs';
import { MisionDTO } from '../models/DTO/MisionDTO';
import { VisionDTO } from '../models/DTO/VisionDTO';
import { HistoriaDTO } from '../models/DTO/HistoriaDTO';
import { ObjetivoDTO } from '../models/DTO/ObjetivoDTO';
import { ValorDTO } from '../models/DTO/ValorDTO';
import { AppConfigService } from './common/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class WhoWeAreService {
  

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private config: AppConfigService

  ) {}



  createMision(contenido: string): Observable<MisionDTO> {

    return this.http.post<MisionDTO>(`${this.config.apiUrlBackend}informacion/mision/agregar/`, { contenido }).pipe(
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
    return this.http.get<any>(`${this.config.apiUrlBackend}informacion/mision/ver/`).pipe(
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
    return this.http.post<VisionDTO>(`${this.config.apiUrlBackend}informacion/vision/agregar/`, { contenido }).pipe(
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
    return this.http.put<MisionDTO>(`${this.config.apiUrlBackend}informacion/mision/${id}/editar/`, { contenido })
      .pipe(
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
    return this.http.get<any>(`${this.config.apiUrlBackend}informacion/vision/ver/`).pipe(
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
    return this.http.put<VisionDTO>(`${this.config.apiUrlBackend}informacion/vision/${id}/editar/`, { contenido }).pipe(
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
    return this.http.post<HistoriaDTO>(`${this.config.apiUrlBackend}informacion/historia/agregar/`, { contenido }).pipe(
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
    return this.http.get<any>(`${this.config.apiUrlBackend}informacion/historia/ver/`).pipe(
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
    return this.http.put<HistoriaDTO>(`${this.config.apiUrlBackend}informacion/historia/${id}/editar/`, { contenido }).pipe(
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
    return this.http.get<ObjetivoDTO[]>(`${this.config.apiUrlBackend}informacion/objetivos/ver/`).pipe(
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
    return this.http.post<ObjetivoDTO>(`${this.config.apiUrlBackend}informacion/objetivos/agregar/`, { titulo, contenido }).pipe(
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
    return this.http.put<ObjetivoDTO>(`${this.config.apiUrlBackend}informacion/objetivos/${id}/editar/`, { titulo, contenido }).pipe(
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
    return this.http.delete<void>(`${this.config.apiUrlBackend}informacion/objetivos/${id}/eliminar/`).pipe(
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
    return this.http.get<ValorDTO[]>(`${this.config.apiUrlBackend}informacion/valores/ver/`).pipe(
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
    return this.http.post<ValorDTO>(`${this.config.apiUrlBackend}informacion/valores/agregar/`, { titulo, contenido }).pipe(
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
    return this.http.put<ValorDTO>(`${this.config.apiUrlBackend}informacion/valores/${id}/editar/`, { titulo, contenido }).pipe(
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
    return this.http.delete<void>(`${this.config.apiUrlBackend}informacion/valores/${id}/eliminar/`).pipe(
      catchError(error => {
        console.error('Error al eliminar valor:', error);
        return throwError(() => error);
      })
    );
  }
}

