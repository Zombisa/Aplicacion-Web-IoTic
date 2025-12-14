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
    // Rutas públicas de información institucional
    '/mision/ver/',
    '/vision/ver/',
    '/historia/ver/',
    '/objetivos/ver/',
    '/objetivos/listar/',
    '/valores/ver/',
    '/valores/listar/',
    // Rutas públicas de registros fotográficos
    '/registrosFotograficos/public/',
    // GET requests a registrosFotograficos (list y retrieve son públicos)
    // Se verifica que sea GET para evitar excluir POST, PUT, DELETE que requieren auth
  ];

  const shouldSkipAuth = excludedPatterns.some(p => req.url.includes(p));

  // Rutas públicas de registros fotográficos, solo GET requests (list y retrieve son públicos)
  const isPublicRegistroFotografico = req.url.includes('/registrosFotograficos/') && 
                                      req.method === 'GET' &&
                                      !req.url.match(/\/registrosFotograficos\/\d+\/(editar|eliminar|update|delete|patch|put)/); // Excluir acciones que requieren auth

  // Si la URL coincide con la lista → no poner token
  if (shouldSkipAuth || isPublicRegistroFotografico) {
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
