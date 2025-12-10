import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { UserDTO } from '../models/DTO/UserDTO';
import { AppConfigService } from './common/app-config.service';

export interface UpdateUserDTO {
  nombre?: string;
  apellido?: string;
  email?: string;
  rol?: string;
}

export interface CreateUserDTO {
  email: string;
  contrasena: string;
  nombre: string;
  apellido: string;
  rol: string;
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

  createUser(userData: CreateUserDTO): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.config.apiUrlBackend}usuarios/crear/`, userData).pipe(
      catchError(error => {
        console.error('Error al crear usuario:', error);
        return throwError(() => error);
      })
    );
  }

  sincronizarFirebase(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.config.apiUrlBackend}usuarios/sincronizar/`, {}).pipe(
      catchError(error => {
        console.error('Error al sincronizar Firebase:', error);
        return throwError(() => error);
      })
    );
  }

  getUserById(userId: number): Observable<UserDTO> {
    // Nota: Si el backend no tiene este endpoint, podemos filtrar de la lista
    // Por ahora asumimos que podemos obtenerlo de la lista o el backend lo soporta
    return this.http.get<UserDTO>(`${this.config.apiUrlBackend}usuarios/${userId}/`).pipe(
      catchError(error => {
        console.error('Error al obtener usuario por ID:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene el usuario actual basado en el email de Firebase
   * @param email Email del usuario autenticado
   */
  getCurrentUserByEmail(email: string): Observable<UserDTO | null> {
    return this.getUsers().pipe(
      map(users => {
        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        return user || null;
      }),
      catchError(error => {
        console.error('Error al obtener usuario actual:', error);
        return throwError(() => error);
      })
    );
  }
}

