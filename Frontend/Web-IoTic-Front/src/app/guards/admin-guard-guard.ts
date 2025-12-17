import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, switchMap, first, timeout, catchError, delay, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    // Este guard se ejecuta DESPUÉS del AuthGuard para rutas como /inventario
    return this.authService.currentUser.pipe(
      // Dar tiempo a que Firebase Auth y AuthGuard actualicen currentUser
      delay(500),
      first(),
      timeout(3000),
      switchMap(user => {
        if (!user) {
          console.warn('Usuario no autenticado (AdminGuard), redirigiendo al login...');
          return of(this.router.createUrlTree(['/login']));
        }

        // Usuario autenticado: verificar si es admin
        return this.authService.isAdmin().pipe(
          take(1),
          map(isAdmin => {
            if (isAdmin) {
              return true;
            } else {
              console.warn('Acceso denegado: no es administrador.');
              return this.router.createUrlTree(['/access-denied']);
            }
          })
        );
      }),
      catchError(error => {
        console.warn('Error en AdminGuard verificando rol de admin:', error);
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}