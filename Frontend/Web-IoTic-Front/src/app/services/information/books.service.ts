import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../common/app-config.service';
import { catchError, Observable, throwError } from 'rxjs';
import { BaseProductivityDTO } from '../../models/Common/BaseProductivityDTO';

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  constructor(private http: HttpClient, private config: AppConfigService){}


  /**
   * Lista los libros disponibles desde el backend.
   * @returns lista de libros desde el backend
   */
  getBooks(): Observable<BaseProductivityDTO[]> {
    return this.http.get<BaseProductivityDTO[]>(
      `${this.config.apiUrlBackend}informacion/libros/listar_libros/`
    ).pipe(
      catchError(error => {
        console.error('Error al obtener libros:', error);
        return throwError(() => error);
      })
    );
  }
  /**
   * Crea un nuevo libro en el backend
   * @param book datos del libro a crear. debe ser de tipo BookPeticion que hereda de BaseProductivityDTO
   * @returns Libro creado.
   */
  postBook(book: BaseProductivityDTO): Observable<BaseProductivityDTO> {
    return this.http.post<BaseProductivityDTO>(
      `${this.config.apiUrlBackend}informacion/libros/agregar_libro/`,
      book
    ).pipe(
      catchError(error => {
        console.error('Error al crear libro:', error);
        return throwError(() => error);
      })
    );
  }
  /**
   * Actualiza la información de un libro existente en el backend.
   * @param id ID del libro a editar
   * @param book Información actualizada del libro, debe ser de tipo BookPeticion que hereda de BaseProductivityDTO
   * @returns 
   */
  editBook(id: number, book: BaseProductivityDTO): Observable<BaseProductivityDTO> {
    return this.http.put<BaseProductivityDTO>(
      `${this.config.apiUrlBackend}informacion/libros/${id}/editar_libro/`,
      book
    ).pipe(
      catchError(error => {
        console.error('Error al editar libro:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina un libro del backend.
   * @param id ID del libro a eliminar
   * @returns 
   */
  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.config.apiUrlBackend}informacion/libros/${id}/eliminar_libro/`
    ).pipe(
      catchError(error => {
        console.error('Error al eliminar libro:', error);
        return throwError(() => error);
      })
    );
  } 
}
