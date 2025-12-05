import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';
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
   */
  getLoans(): Observable<LoanDTO[]> {
    
      return this.http.get<LoanDTO[]>(`${this.config.apiUrlBackend}inventario/prestamos/`).pipe(
        catchError(error => {
          console.error('Error al obtener préstamos:', error);
          return throwError(() => error);
        })
      );
  }
    /**
   * Obtener préstamo por ID
   */
  getLoanById(id: number): Observable<LoanDTOConsultById> {
    
    return this.http.get<LoanDTOConsultById>(`${this.config.apiUrlBackend}inventario/prestamos/` + id, )
    .pipe(
      catchError(error => {
        console.error('Error al obtener préstamo por ID:', error);
        return throwError(() => error);
      })
    );
  }

  getLoansCurrent(): Observable<LoanDTO[]> {
      return  this.http.get<LoanDTO[]>(`${this.config.apiUrlBackend}inventario/prestamos/activos/`).pipe(
      catchError(error => {
        console.error('Error al obtener préstamos activos:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener préstamos vencidos
   */
  getOverdueLoans(): Observable<LoanDTO[]> {
    return this.http.get<LoanDTO[]>(`${this.config.apiUrlBackend}inventario/prestamos/vencidos/`).pipe(
      catchError(error => {
        console.error('Error al obtener préstamos vencidos:', error);
        return throwError(() => error);
      })
    );
  }

    /**
   * Crear un nuevo préstamo
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
   returnLoan(id: number): Observable<LoanDTO> {
    return this.http.post<LoanDTO>(`${this.config.apiUrlBackend}inventario/prestamos/devolucion/${id}/`, {}).pipe(
      catchError(error => {
        console.error('Error al devolver préstamo:', error);
        return throwError(() => error);
      })
    );
  }
  
}
