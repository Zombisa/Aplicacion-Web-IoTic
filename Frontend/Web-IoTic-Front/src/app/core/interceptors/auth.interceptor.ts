import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, from, switchMap, catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AppConfigService } from '../../services/common/app-config.service';

/**
 * Interceptor HTTP que agrega automáticamente el token de autenticación
 * a todas las peticiones HTTP salientes.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const authService = inject(AuthService);
  const configService = inject(AppConfigService);

  const backendUrl = configService.apiUrlBackend;  // ej: http://localhost:8000/

  // Excluir URLs que NO sean del backend (Cloudflare, Firebase, etc.)
  const isExternalRequest = !req.url.startsWith(backendUrl);

  if (isExternalRequest) {
    console.log("🔵 Saltando interceptor para URL externa:", req.url);
    return next(req);
  }

  // Excluir endpoints públicos de "Who We Are" 
  const publicEndpoints = [
    '/mision/ver/',
    '/vision/ver/',
    '/historia/ver/',
    '/objetivos/ver/',
    '/valores/ver/'
  ];
  
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));
  
  if (isPublicEndpoint) {
    console.log("Saltando interceptor para endpoint público:", req.url);
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
        // Si no hay token, permitir la petición sin autenticación
        // El backend decidirá si requiere autenticación o no
        console.log("Petición sin token:", req.url);
        return next(req);
      }
    }),
    catchError(error => {
      // Si hay error al obtener el token, permitir la petición de todas formas
      // Esto permite que endpoints públicos funcionen sin autenticación
      console.log("Error al obtener token:", req.url);
      return next(req);
    })
  );
};
