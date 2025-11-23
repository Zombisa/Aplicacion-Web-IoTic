import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, from, switchMap, catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

/**
 * Interceptor HTTP que agrega automáticamente el token de autenticación
 * a todas las peticiones HTTP salientes.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  // URLs que no necesitan token (ej: login, register, públicas)
  const excludedUrls = [
    '/auth/login',
    '/auth/register',
    '/public',
    'assets/',
    '.txt',
    'historia.txt'
  ];

  // Verificar si la URL está excluida
  const isExcluded = excludedUrls.some(url => req.url.includes(url));
  if (isExcluded) {
    return next(req);
  }

  // Obtener token cacheado del AuthService
  return from(authService.getToken()).pipe(
    switchMap(token => {
      if (token && token.trim() !== '') {
        // Clonar la petición y agregar el header de autorización
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        return next(authReq);
      } else {
        // No hay token, rechazar la petición si requiere autenticación
        console.warn('No se obtuvo token de autenticación para:', req.url);
        return throwError(() => new Error('Usuario no autenticado. Por favor, inicia sesión.'));
      }
    }),
    catchError(error => {
      console.error(' Error en interceptor de autenticación:', error);
      return throwError(() => error);
    })
  );
};
