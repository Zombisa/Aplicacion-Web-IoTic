import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../common/app-config.service';
import { catchError, Observable, throwError } from 'rxjs';
import { CapBookPeticion } from '../../models/Peticion/CapBookPeticion';
import { CapBookDTO } from '../../models/DTO/CapBookDTO';

@Injectable({
  providedIn: 'root',
})
export class CapBookService {
  constructor(private http: HttpClient, private config: AppConfigService) {}
  /**
   * Trae todos los capítulos de libros
   * @returns Lista los capítulos de libros disponibles desde el backend.
   */
  getCapBooks(): Observable<CapBookDTO[]> {
    return this.http.get<CapBookDTO[]>(
      `${this.config.apiUrlBackend}informacion/capLibros/`
    ).pipe(
      catchError((error) => {
        console.error('Error al obtener capítulos de libros:', error);
        return throwError(() => error);
      })
    );
  }
  /**
   * Crea un nuevo capítulo de libro en el backend
   * @param capBook datos del capítulo de libro a crear.
   * @returns CapBook creado.
   */
  postCapBook(capBook: CapBookPeticion): Observable<CapBookDTO> {
    return this.http.post<CapBookDTO>(
      `${this.config.apiUrlBackend}informacion/capLibros/capitulo_libro/`,
      capBook
    ).pipe(
      catchError((error) => {
        console.error('Error al crear capítulo de libro:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza la información de un capítulo de libro existente en el backend.
   * @param id ID del capítulo de libro a editar
   * @param capBook Información actualizada del capítulo de libro
   * @returns CapBook editado.
   */
  editCapBook(id: number, capBook: CapBookPeticion): Observable<CapBookDTO> {
    return this.http.put<CapBookDTO>(
      `${this.config.apiUrlBackend}informacion/capLibros/${id}/capitulo_libro/`,
      capBook
    ).pipe(
      catchError((error) => {
        console.error('Error al editar capítulo de libro:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina un capítulo de libro existente en el backend.
   * @param id ID del capítulo de libro a eliminar
   * @returns Observable con la respuesta del backend.
   *  
   */
  deleteCapBook(id: number): Observable<any> {
    return this.http.delete(
      `${this.config.apiUrlBackend}informacion/capLibros/${id}/capitulo_libro/`
    ).pipe(
      catchError((error) => {
        console.error('Error al eliminar capítulo de libro:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene un capítulo de libro por su ID desde el backend.
   * @param id ID del capítulo de libro a obtener
   * @returns CapBook encontrado
   */
  getById(id: number): Observable<CapBookDTO> {
    return this.http.get<CapBookDTO>(
      `${this.config.apiUrlBackend}informacion/capLibros/${id}/`
    ).pipe(
      catchError((error) => {
        console.error('Error al obtener capítulo de libro por ID:', error);
        return throwError(() => error);
      })
    );
  }

}
