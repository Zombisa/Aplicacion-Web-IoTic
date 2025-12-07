import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../common/app-config.service';
import { catchError, Observable, throwError } from 'rxjs';
import { BookPeticion } from '../../models/Peticion/BookPeticion';
import { BookDTO } from '../../models/DTO/BookDTO';

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  constructor(private http: HttpClient, private config: AppConfigService){}


  /**
   * Lista los libros disponibles desde el backend.
   * @returns lista de libros desde el backend
   */
  getBooks(): Observable<BookDTO[]> {
    return this.http.get<BookDTO[]>(
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
   * @param book datos del libro a crear. debe ser de tipo BookPeticion que hereda de BookPeticion
   * @returns Libro creado.
   */
  postBook(book: BookPeticion): Observable<BookDTO> {
    return this.http.post<BookDTO>(
      `${this.config.apiUrlBackend}informacion/libros/libro/`,
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
   * @param book Información actualizada del libro, debe ser de tipo BookPeticion que hereda de BookPeticion
   * @returns 
   */
  editBook(id: number, book: BookPeticion): Observable<BookDTO> {
    return this.http.put<BookDTO>(
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
