import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AppConfigService } from '../../services/common/app-config.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const authService = inject(AuthService);
  const configService = inject(AppConfigService);

  const backendUrl = configService.apiUrlBackend || '';

  // Lista ÚNICA de rutas que NO llevan token
  const excludedPatterns = [
    'firebase',
    'cloudflare',
    'storage.googleapis',
    '.jpg',
    '.png',
    '.jpeg',
    '.webp',
    '/assets/',
    '/mision/ver/',
    '/vision/ver/',
    '/historia/ver/',
    '/objetivos/ver/',
    '/valores/ver/',
    '/informacion/publicaciones/'
  ];

  const shouldSkipAuth = excludedPatterns.some(p => req.url.includes(p));

  // Si la URL coincide con la lista → no poner token
  if (shouldSkipAuth) {
    return next(req);
  }

  // Si la URL NO es del backend → no poner token
  if (!req.url.startsWith(backendUrl)) {
    return next(req);
  }

  // Obtener token y agregarlo
  return from(authService.getToken()).pipe(
    switchMap(token => {
      if (!token) return next(req);

      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      return next(authReq);
    })
  );
};
