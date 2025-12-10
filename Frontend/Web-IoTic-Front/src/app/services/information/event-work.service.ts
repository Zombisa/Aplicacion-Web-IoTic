import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../common/app-config.service';
import { catchError, Observable, throwError } from 'rxjs';
import { EventWorkDTO } from '../../models/DTO/EventWorkDTO';
import { EventWorkPeticion } from '../../models/Peticion/EventWorkPeticion';

@Injectable({
  providedIn: 'root'
})
export class EventWorkService {
  constructor(private http: HttpClient, private config: AppConfigService) {}

  /**
   * Lista los trabajos en eventos disponibles desde el backend.
   * @returns Lista de trabajos en eventos desde el backend
   */
  getEventWorks(): Observable<EventWorkDTO[]> {
    return this.http.get<EventWorkDTO[]>(
      `${this.config.apiUrlBackend}informacion/trabajoEventos/`
    ).pipe(
      catchError(error => {
        console.error('Error al obtener trabajos en eventos:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crea un nuevo trabajo en evento en el backend
   * @param eventWork datos del trabajo en evento a crear
   * @returns Trabajo en evento creado
   */
  postEventWork(eventWork: EventWorkPeticion): Observable<EventWorkDTO> {
    return this.http.post<EventWorkDTO>(
      `${this.config.apiUrlBackend}informacion/trabajoEventos/agregar_trabajo_evento/`,
      eventWork
    ).pipe(
      catchError(error => {
        console.error('Error al crear trabajo en evento:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza la información de un trabajo en evento existente en el backend.
   * @param id ID del trabajo en evento a editar
   * @param eventWork Información actualizada del trabajo en evento
   * @returns Trabajo en evento editado
   */
  editEventWork(id: number, eventWork: EventWorkPeticion): Observable<EventWorkDTO> {
    return this.http.put<EventWorkDTO>(
      `${this.config.apiUrlBackend}informacion/trabajoEventos/${id}/editar_trabajo_evento/`,
      eventWork
    ).pipe(
      catchError(error => {
        console.error('Error al editar trabajo en evento:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina un trabajo en evento del backend.
   * @param id ID del trabajo en evento a eliminar
   * @returns 
   */
  deleteEventWork(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.config.apiUrlBackend}informacion/trabajoEventos/${id}/eliminar_trabajo_evento/`
    ).pipe(
      catchError(error => {
        console.error('Error al eliminar trabajo en evento:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene un trabajo en evento por ID desde el backend.
   * @param id ID del trabajo en evento a obtener
   * @returns Trabajo en evento encontrado
   */
  getEventWorkById(id: number): Observable<EventWorkDTO> {
    return this.http.get<EventWorkDTO>(
      `${this.config.apiUrlBackend}informacion/trabajoEventos/${id}/`
    ).pipe(
      catchError(error => {
        console.error('Error al obtener trabajo en evento por ID:', error);
        return throwError(() => error);
      })
    );
  }
}

