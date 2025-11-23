import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, from, switchMap, catchError, throwError, take, timeout } from 'rxjs';
import { AuthService } from '../../services/auth.service';

/**
 * Interceptor HTTP que agrega automáticamente el token de autenticación 
 * a todas las peticiones HTTP salientes
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
    console.log('🔓 Petición excluida de autenticación:', req.url);
    return next(req);
  }

  // Usar currentUser con timeout para evitar bloqueos
  return authService.currentUser.pipe(
    take(1), // Solo tomar el primer valor emitido
    timeout(5000), // Timeout de 5 segundos
    switchMap(user => {
      console.log('👤 Usuario en interceptor:', user ? 'Autenticado' : 'No autenticado');
      
      if (user) {
        // Si hay usuario, obtener el token
        return from(user.getIdToken(true)).pipe(
          switchMap(token => {
            if (token && token.trim() !== '') {
              // Clonar la petición y agregar el header de autorización
              const authReq = req.clone({
                setHeaders: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              console.log('🔐 Token agregado a petición:', req.url);
              console.log('🔐 Token preview:', token.substring(0, 20) + '...');
              return next(authReq);
            } else {
              console.error('❌ Token vacío obtenido del usuario');
              return throwError(() => new Error('Token de autenticación vacío'));
            }
          }),
          catchError(tokenError => {
            console.error('❌ Error obteniendo token del usuario:', tokenError);
            return throwError(() => new Error(`Error obteniendo token: ${tokenError.message}`));
          })
        );
      } else {
        // No hay usuario autenticado
        console.warn('⚠️ No hay usuario autenticado para la petición:', req.url);
        
        // Si la petición requiere autenticación, rechazar
        if (req.url.includes('/api/')) {
          return throwError(() => new Error('Usuario no autenticado. Por favor, inicia sesión.'));
        }
        
        // Si no requiere autenticación, continuar sin token
        return next(req);
      }
    }),
    catchError(error => {
      console.error('❌ Error en interceptor de autenticación:', error);
      if (error.name === 'TimeoutError') {
        return throwError(() => new Error('Timeout esperando autenticación. Por favor, recarga la página.'));
      }
      return throwError(() => error);
    })
  );
};
