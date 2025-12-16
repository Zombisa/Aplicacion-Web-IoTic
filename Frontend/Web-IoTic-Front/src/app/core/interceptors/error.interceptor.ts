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
          
          // Limpiar localStorage si existe (pero NO limpiar Firebase Auth que está en IndexedDB)
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('token');
          }
          
          // Solo redirigir al login si:
          // 1. La ruta actual NO es el login
          // 2. La ruta actual NO es una ruta pública del frontend
          // 3. La petición NO es a una ruta pública del backend
          // 4. NO estamos en el proceso de inicialización (primeros 3 segundos)
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
          
          // Verificar si estamos en proceso de inicialización (primeros 3 segundos después de cargar)
          // Esto evita redirecciones prematuras mientras Firebase Auth restaura la sesión
          const timeSinceLoad = performance.now();
          const isInitializing = timeSinceLoad < 3000; // Primeros 3 segundos
          
          // Solo redirigir si:
          // - La ruta actual es protegida
          // - La petición no es pública
          // - NO estamos en proceso de inicialización
          if (!isPublicFrontendRoute && !isPublicBackendRoute && !isInitializing) {
            console.warn('🔄 Redirigiendo al login por error 401');
            router.navigate(['/login']);
          } else if (isInitializing) {
            console.log('⏳ Ignorando error 401 durante inicialización (Firebase Auth restaurando sesión)');
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
