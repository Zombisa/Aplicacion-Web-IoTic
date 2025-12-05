import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { UserDTO } from '../models/DTO/UserDTO';
import { AppConfigService } from './common/app-config.service';

export interface UpdateUserDTO {
  nombre?: string;
  apellido?: string;
  email?: string;
  rol?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  

  constructor(private http: HttpClient, private config: AppConfigService) {}

  getUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.config.apiUrlBackend}usuarios/`).pipe(
      catchError(error => {
        console.error('Error al obtener usuarios:', error);
        return throwError(() => error);
      })
    );
  }

  getRoles(): Observable<{ id: number; nombre: string }[]> {
    return this.http.get<{ id: number; nombre: string }[]>(`${this.config.apiUrlBackend}usuarios/roles/`).pipe(
      catchError(error => {
        console.error('Error al obtener roles:', error);
        return throwError(() => error);
      })
    );
  }

  updateUser(userId: number, userData: UpdateUserDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.config.apiUrlBackend}usuarios/${userId}/`, userData).pipe(
      catchError(error => {
        console.error('Error al actualizar usuario:', error);
        return throwError(() => error);
      })
    );
  }

  toggleUserStatus(userId: number): Observable<UserDTO> {
    return this.http.patch<UserDTO>(`${this.config.apiUrlBackend}usuarios/${userId}/estado/`, {}).pipe(
      catchError(error => {
        console.error('Error al cambiar estado del usuario:', error);
        return throwError(() => error);
      })
    );
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.config.apiUrlBackend}usuarios/${userId}/eliminar/`).pipe(
      catchError(error => {
        console.error('Error al eliminar usuario:', error);
        return throwError(() => error);
      })
    );
  }
}

