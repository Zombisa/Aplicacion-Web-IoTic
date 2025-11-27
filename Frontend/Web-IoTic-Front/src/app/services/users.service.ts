import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { UserDTO } from '../models/DTO/UserDTO';

export interface UpdateUserDTO {
  nombre?: string;
  apellido?: string;
  email?: string;
  rol?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private apiUrl = 'http://localhost:8000/api/';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}usuarios/`).pipe(
      catchError(error => {
        console.error('Error al obtener usuarios:', error);
        return throwError(() => error);
      })
    );
  }

  getRoles(): Observable<{ id: number; nombre: string }[]> {
    return this.http.get<{ id: number; nombre: string }[]>(`${this.apiUrl}usuarios/roles/`).pipe(
      catchError(error => {
        console.error('Error al obtener roles:', error);
        return throwError(() => error);
      })
    );
  }

  updateUser(userId: number, userData: UpdateUserDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}usuarios/${userId}/`, userData).pipe(
      catchError(error => {
        console.error('Error al actualizar usuario:', error);
        return throwError(() => error);
      })
    );
  }

  toggleUserStatus(userId: number): Observable<UserDTO> {
    return this.http.patch<UserDTO>(`${this.apiUrl}usuarios/${userId}/estado/`, {}).pipe(
      catchError(error => {
        console.error('Error al cambiar estado del usuario:', error);
        return throwError(() => error);
      })
    );
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}usuarios/${userId}/eliminar/`).pipe(
      catchError(error => {
        console.error('Error al eliminar usuario:', error);
        return throwError(() => error);
      })
    );
  }
}

