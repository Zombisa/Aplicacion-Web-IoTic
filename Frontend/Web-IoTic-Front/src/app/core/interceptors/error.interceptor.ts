import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

/**
 * Interceptor para manejo global de errores HTTP
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('❌ Error HTTP interceptado:', error);

      switch (error.status) {
        case 401:
          console.warn('🔐 Token expirado o inválido - Redirigiendo al login');
          // Limpiar localStorage si existe
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('token');
          }
          router.navigate(['/login']);
          break;

        case 403:
          console.warn('🚫 Acceso denegado');
          break;

        case 404:
          console.warn('📭 Recurso no encontrado');
          break;

        case 500:
          console.error('🔥 Error interno del servidor');
          break;

        case 0:
          console.error('🌐 Error de conectividad - Verificar conexión');
          break;

        default:
          console.error(`💥 Error HTTP ${error.status}:`, error.message);
      }

      return throwError(() => error);
    })
  );
};
