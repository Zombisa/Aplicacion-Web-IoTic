import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService } from '../common/app-config.service';
import { catchError, Observable, throwError } from 'rxjs';
import { CourseDTO } from '../../models/DTO/CourseDTO';
import { CoursePeticion } from '../../models/Peticion/CoursePeticion';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(private http: HttpClient, private config: AppConfigService) {}

  /**
   * Lista los cursos disponibles desde el backend.
   * @returns Lista de cursos desde el backend
   */
  getCourses(): Observable<CourseDTO[]> {
    return this.http.get<CourseDTO[]>(
      `${this.config.apiUrlBackend}informacion/cursos/`
    ).pipe(
      catchError(error => {
        console.error('Error al obtener cursos:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crea un nuevo curso en el backend
   * @param course datos del curso a crear
   * @returns Curso creado
   */
  postCourse(course: CoursePeticion): Observable<CourseDTO> {
    return this.http.post<CourseDTO>(
      `${this.config.apiUrlBackend}informacion/cursos/agregar_curso/`,
      course
    ).pipe(
      catchError(error => {
        console.error('Error al crear curso:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza la información de un curso existente en el backend.
   * @param id ID del curso a editar
   * @param course Información actualizada del curso
   * @returns Curso editado
   */
  editCourse(id: number, course: CoursePeticion): Observable<CourseDTO> {
    return this.http.put<CourseDTO>(
      `${this.config.apiUrlBackend}informacion/cursos/${id}/editar_curso/`,
      course
    ).pipe(
      catchError(error => {
        console.error('Error al editar curso:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina un curso del backend.
   * @param id ID del curso a eliminar
   * @returns 
   */
  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.config.apiUrlBackend}informacion/cursos/${id}/eliminar_curso/`
    ).pipe(
      catchError(error => {
        console.error('Error al eliminar curso:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene un curso por ID desde el backend.
   * @param id ID del curso a obtener
   * @returns Curso encontrado
   */
  getCourseById(id: number): Observable<CourseDTO> {
    return this.http.get<CourseDTO>(
      `${this.config.apiUrlBackend}informacion/cursos/${id}/`
    ).pipe(
      catchError(error => {
        console.error('Error al obtener curso por ID:', error);
        return throwError(() => error);
      })
    );
  }
}

