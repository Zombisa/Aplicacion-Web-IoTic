import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';
import { LoanDTO } from '../models/DTO/LoanDTO';
import { LoanPeticion } from '../models/Peticion/LoanPeticion';
import { LoanDTOConsultById } from '../models/DTO/LoanDTOConsultById';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
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
  /**
   * Consultar todos los préstamos
   */
  getLoans(): Observable<LoanDTO[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.get<LoanDTO[]>(`${this.apiUrl}inventario/prestamos/`, { headers })
      ),
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
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.get<LoanDTOConsultById>(`${this.apiUrl}inventario/prestamos/` + id, { headers })
      ),
      catchError(error => {
        console.error('Error al obtener préstamo por ID:', error);
        return throwError(() => error);
      })
    );
  }

  getLoansCurrent(): Observable<LoanDTO[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.get<LoanDTO[]>(`${this.apiUrl}inventario/prestamos/activos/`, { headers })
      ),
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
    return this.getAuthHeaders().pipe(
      switchMap(headers => 
        this.http.get<LoanDTO[]>(`${this.apiUrl}inventario/prestamos/vencidos/`, { headers })
      ),
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
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        console.log("Préstamo a crear:", JSON.stringify(loanData, null, 2));
        return this.http.post<LoanDTO>(`${this.apiUrl}inventario/prestamos/`, loanData, { headers });
      }),
      catchError(error => {
        console.error('Error al crear préstamo:', error);
        console.error('Status:', error.status);
        console.error('Error body:', error.error);
        return throwError(() => error);
      })
    );

  }
   returnLoan(id: number): Observable<LoanDTO> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const url = `${this.apiUrl}inventario/prestamos/${id}/devolver/`;
        console.log(`Marcando préstamo ${id} como devuelto...`);
        return this.http.put<LoanDTO>(url, {}, { headers });
      }),
      catchError(error => {
        console.error('Error al marcar préstamo como devuelto:', error);
        console.error('Status:', error.status);
        console.error('Error body:', error.error);
        return throwError(() => error);
      })
    );
  }
  
}
