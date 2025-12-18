import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AppConfigService } from '../../services/common/app-config.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const authService = inject(AuthService);
  const config = inject(AppConfigService);

  const backendUrl = config.apiUrlBackend;
  if (!backendUrl || !req.url.startsWith(backendUrl)) {
    return next(req); // no es backend
  }

  // ✅ RUTAS PÚBLICAS (solo GET) - Información
  const publicGetRoutes = [
    '/api/mision/ver/',
    '/api/vision/ver/',
    '/api/historia/ver/',
    '/api/valores/ver/',
    '/api/objetivos/ver/',
    '/api/objetivos/listar/',
    '/api/valores/listar/',
    '/api/informacion/libros/',
    '/api/informacion/capLibros/',
    '/api/informacion/eventos/',
    '/api/informacion/jurados/',
    '/api/informacion/cursos/',
    '/api/informacion/revistas/',
    '/api/informacion/procesosTecnicas/',
    '/api/informacion/participacionComitesEv/',
    '/api/informacion/noticias/',
    '/api/informacion/materialDidactico/',
    '/api/informacion/tutoriasEnMarcha/',
    '/api/informacion/tutoriasConcluidas/',
    '/api/informacion/trabajoEventos/',
    '/api/informacion/software/',
    '/api/registrosFotograficos/public/',
  ];

  // ✅ Verificar si es GET y la URL es pública
  const isPublicGet = publicGetRoutes.some(route => 
    req.url.startsWith(backendUrl + route)
  );

  if (isPublicGet && req.method === 'GET') {
    return next(req);
  }

  // 🔐 TODO LO DEMÁS LLEVA TOKEN (DELETE, PUT, POST, PATCH, etc.)
  return from(authService.getToken()).pipe(
    switchMap(token => {
      if (!token) {
        console.warn('⚠️ Request sin token:', req.url);
        return next(req);
      }

      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      return next(authReq);
    })
  );
};
