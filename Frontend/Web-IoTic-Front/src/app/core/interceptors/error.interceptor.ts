import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Interceptor para manejo global de errores HTTP
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('❌ Error HTTP interceptado:', error);

      switch (error.status) {
        case 401:
          console.warn('🔐 Token expirado o inválido - Invalidando cache');
          
          // Invalidar cache del token
          authService.invalidateTokenCache();
          
          // Limpiar localStorage si existe
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('token');
          }
          
          // Solo redirigir al login si:
          // 1. La ruta actual NO es el login
          // 2. La ruta actual NO es una ruta pública del frontend
          // 3. La petición NO es a una ruta pública del backend
          const currentUrl = router.url;
          
          // Rutas públicas del frontend (sin AuthGuard)
          const publicFrontendRoutes = [
            '/login',
            '/home',
            '/who-we-are',
            '/productividad',
            '/registro-fotografico',
            '/contacto'
          ];
          const isPublicFrontendRoute = publicFrontendRoutes.some(route => 
            currentUrl === route || currentUrl.startsWith(route + '/')
          );
          
          // Rutas públicas del backend (no requieren token)
          const isPublicBackendRoute = req.url.includes('/mision/ver/') ||
                                       req.url.includes('/vision/ver/') ||
                                       req.url.includes('/historia/ver/') ||
                                       req.url.includes('/objetivos/ver/') ||
                                       req.url.includes('/objetivos/listar/') ||
                                       req.url.includes('/valores/ver/') ||
                                       req.url.includes('/valores/listar/') ||
                                       (req.url.includes('/registrosFotograficos/') && req.method === 'GET');
          
          // Solo redirigir si la ruta actual es protegida y la petición no es pública
          if (!isPublicFrontendRoute && !isPublicBackendRoute) {
            router.navigate(['/login']);
          }
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
