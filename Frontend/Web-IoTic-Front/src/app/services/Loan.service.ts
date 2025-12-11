import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { LoanDTO } from '../models/DTO/LoanDTO';
import { LoanPeticion } from '../models/Peticion/LoanPeticion';
import { LoanDTOConsultById } from '../models/DTO/LoanDTOConsultById';
import { AppConfigService } from './common/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private config: AppConfigService
  ) {}

  /**
   * Consultar todos los préstamos
   * @returns Observable<LoanDTO[]> Lista de préstamos
   */
  getLoans(): Observable<LoanDTO[]> {
      return this.http.get<LoanDTO[]>(`${this.config.apiUrlBackend}inventario/prestamos/history/`).pipe(
        catchError(error => {
          console.error('Error al obtener préstamos:', error);
          return throwError(() => error);
        })
      );
  }
    /**
   * Obtener préstamo por ID
   * @param id ID del préstamo
   * @returns Observable<LoanDTOConsultById> Detalles del préstamo
   */
  getLoanById(id: number): Observable<LoanDTOConsultById> {
    return this.http.get<LoanDTOConsultById>(`${this.config.apiUrlBackend}inventario/prestamos/${id}/`)
    .pipe(
      catchError(error => {
        console.error('Error al obtener préstamo por ID:', error);
        return throwError(() => error);
      })
    );
  }
  /**
   * Obtener préstamos todos los préstamos activos 
   * @returns Observable<LoanDTO[]> Préstamos activos
   */
  getLoansCurrent(): Observable<LoanDTO[]> {
      return  this.http.get<LoanDTO[]>(`${this.config.apiUrlBackend}inventario/prestamos/active/`).pipe(
      catchError(error => {
        console.error('Error al obtener préstamos activos:', error);
        return throwError(() => error);
      })
    );
  }
  /**
   * Retorna los préstamos que han sido devueltos
   * @returns Observable<LoanDTO[]> Obtener préstamos devueltos
   */
  getLoansReturned(): Observable<LoanDTO[]> {
      return this.http.get<LoanDTO[]>(`${this.config.apiUrlBackend}inventario/prestamos/returned/`).pipe(
      catchError(error => {
        console.error('Error al obtener préstamos devueltos:', error);
        return throwError(() => error);
      })
    );
  }


  /**
   * Obtener préstamos vencidos
   * @returns Observable<LoanDTO[]> Préstamos vencidos
   */
  getOverdueLoans(): Observable<LoanDTO[]> {
    return this.http.get<LoanDTO[]>(`${this.config.apiUrlBackend}inventario/prestamos/overdue/`).pipe(
      catchError(error => {
        console.error('Error al obtener préstamos vencidos:', error);
        return throwError(() => error);
      })
    );
  }
  /**
   * Obtener préstamos por vencer dentro de 48 horas antes de su fecha de devolución
   * @returns Observable<LoanDTO[]> Préstamos por vencer
   */
  getLoansAboutToExpire(): Observable<LoanDTO[]> {
    return this.http.get<LoanDTO[]>(`${this.config.apiUrlBackend}inventario/prestamos/por-vencer/`).pipe(
      catchError(error => {
        console.error('Error al obtener préstamos por vencer:', error);
        return throwError(() => error);
      })
    );
  }

    /**
   * Crear un nuevo préstamo
   * @param loanData Datos del préstamo a crear
   * @returns Observable<LoanDTO> Préstamo creado
   */
  createLoan(loanData: LoanPeticion): Observable<LoanDTO> {
      console.log("Préstamo a crear:", JSON.stringify(loanData, null, 2));
      return this.http.post<LoanDTO>(`${this.config.apiUrlBackend}inventario/prestamos/`, loanData).pipe(
      catchError(error => {
        console.error('Error al crear préstamo:', error);
        console.error('Status:', error.status);
        console.error('Error body:', error.error);
        return throwError(() => error);
      })
    );

  }
  /**
   * Devolver un préstamo
   * @param id ID del préstamo a devolver
   * @returns Observable<LoanDTO> Préstamo devuelto
   */
  returnLoan(id: number): Observable<LoanDTO> {
    return this.http.patch<LoanDTO>(`${this.config.apiUrlBackend}inventario/prestamos/${id}/`, {}).pipe(
      catchError(error => {
        console.error('Error al devolver préstamo:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener préstamo activo de un item por ID del item
   * @param itemId ID del item
   * @returns Observable<LoanDTO | null> Préstamo activo del item o null si no existe
   */
  getActiveLoanByItemId(itemId: number): Observable<LoanDTO | null> {
    return this.http.get<LoanDTO[]>(`${this.config.apiUrlBackend}inventario/items/${itemId}/loans/?activo=true`).pipe(
      map(loans => {
        // Retornar el primer préstamo activo si existe, null si no hay
        if (loans && loans.length > 0) {
          return loans[0];
        }
        return null;
      }),
      catchError(error => {
        // Si es 404 o no hay préstamos, retornar null en lugar de error
        if (error.status === 404) {
          return of(null);
        }
        console.error('Error al obtener préstamo activo del item:', error);
        return throwError(() => error);
      })
    );
  }
  
  
}
