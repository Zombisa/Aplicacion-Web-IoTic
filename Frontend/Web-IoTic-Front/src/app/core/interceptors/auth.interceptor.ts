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

  // Agrupar rutas excluidas por servicio
  const excludedRoutesByService = {
    informacion: [
      '/mision/ver/',
      '/vision/ver/',
      '/historia/ver/',
      '/objetivos/ver/',
      '/objetivos/listar/',
      '/valores/ver/',
      '/valores/listar/',
      '/informacion/libros/', // Ruta de getBooks
      '/informacion/libros/:id/', // Ruta de getById
      '/informacion/capLibros/', // Ruta de getCapBooks
      '/informacion/eventos/', // Ruta de getAll eventos
      '/informacion/eventos/:id/', // Ruta de getById eventos
      '/informacion/jurados/', // Ruta de getAll jurados
      '/informacion/jurados/:id/', // Ruta de getById jurados
      '/informacion/cursos/', // Ruta de getAll cursos
      '/informacion/cursos/:id/', // Ruta de getById cursos
      '/informacion/revistas/', // getAll revista
      '/informacion/revistas/:id/', // getById revista
      '/informacion/procesosTecnicas/', // getAll proceso-tecnica
      '/informacion/procesosTecnicas/:id/', // getById proceso-tecnica
      '/informacion/participacionComitesEv/', // getAll participacion-comites-ev
      '/informacion/participacionComitesEv/:id/', // getById participacion-comites-ev
      '/informacion/noticias/', // getAll noticia
      '/informacion/noticias/:id/', // getById noticia
      '/informacion/materialDidactico/', // getAll material-didactico
      '/informacion/materialDidactico/:id/', // getById material-didactico
      '/informacion/tutoriasEnMarcha/', // getAll tutoria-en-marcha
      '/informacion/tutoriasEnMarcha/:id/', // getById tutoria-en-marcha
      '/informacion/tutoriasConcluidas/', // getAll tutoria-concluida
      '/informacion/tutoriasConcluidas/:id/', // getById tutoria-concluida
      '/informacion/trabajoEventos/', // getAll trabajo-eventos
      '/informacion/trabajoEventos/:id/', // getById trabajo-eventos
      '/informacion/software/', // getAll software
      '/informacion/software/:id/', // getById software
    ],
    registrosFotograficos: [
      '/registrosFotograficos/public/',
    ],
  };

  // Verificar si la URL coincide con alguna ruta excluida y es un GET
  const shouldSkipAuth = Object.entries(excludedRoutesByService).some(([service, routes]) => {
    if (service === 'general') return false; // Excluir "general" de esta lógica
    return routes.some(route => {
      const regex = new RegExp(route.replace(':id', '\\d+')); // Reemplazar :id con un patrón numérico
      return regex.test(req.url) && req.method === 'GET';
    });
  });

  // Si la URL coincide con la lista → no poner token
  if (shouldSkipAuth) {
    return next(req);
  }

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
