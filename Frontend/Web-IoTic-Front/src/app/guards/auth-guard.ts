import { Injectable, Inject, Optional, PLATFORM_ID } from '@angular/core';
import { CanActivate, CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, Observable, first, timeout, catchError, of, delay, filter, take, switchMap } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { isPlatformBrowser } from '@angular/common';
import { authState } from '@angular/fire/auth';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService, 
    private router: Router,
    @Optional() private afAuth: Auth,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    // Estrategia mejorada: esperar a que Firebase Auth termine de restaurar la sesión
    // authState puede emitir null inicialmente, luego el usuario si existe
    // Necesitamos esperar hasta que Firebase Auth termine de verificar localStorage
    
    if (!isPlatformBrowser(this.platformId) || !this.afAuth) {
      return of(this.router.createUrlTree(['/login']));
    }

    // Usar authState directamente de Firebase para obtener el estado más actualizado
    return authState(this.afAuth).pipe(
      // Esperar un momento para que Firebase Auth verifique localStorage
      delay(1000), // Aumentado a 1 segundo para dar más tiempo
      // Tomar el primer valor después del delay
      first(),
      // Timeout de 5 segundos para dar tiempo suficiente
      timeout(5000),
      map(user => {
        if (user) {
          
          // Actualizar el BehaviorSubject del AuthService para mantener consistencia
          (this.authService as any).currentUserSubject.next(user);
          return true; 
        } else {
          
          return this.router.createUrlTree(['/login']); 
        }
      }),
      catchError(error => {

        console.warn('⏱ Timeout verificando autenticación, verificando estado actual...', error);
        
        // Verificar directamente currentUser de Firebase Auth
        const currentUser = this.afAuth?.currentUser;
        if (currentUser) {
  
          (this.authService as any).currentUserSubject.next(currentUser);
          return of(true);
        }
        
        // Si aún no hay usuario, verificar una vez más con authState
        return authState(this.afAuth).pipe(
          delay(1000),
          first(),
          timeout(3000),
          map(user => {
            if (user) {
              console.log('✅ Usuario encontrado en segundo intento');
              (this.authService as any).currentUserSubject.next(user);
              return true;
            }
            console.warn('No se encontró usuario autenticado después de múltiples intentos');
            return this.router.createUrlTree(['/login']);
          }),
          catchError(() => {
            console.warn(' Error final verificando autenticación');
            return of(this.router.createUrlTree(['/login']));
          })
        );
      })
    );
  }
}