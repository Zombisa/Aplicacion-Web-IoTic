import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs/internal/Observable';
import { map, take } from 'rxjs';

    @Injectable({
      providedIn: 'root'
    })
    export class AdminGuard implements CanActivate {

      constructor(private authService: AuthService, private router: Router) {}

      canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        return this.authService.isAdmin().pipe(
          take(1), // Toma solo el primer valor y luego completa el Observable
          map(isAdmin => {
            if (isAdmin) {
              return true; // Permitir acceso a la ruta
            } else {
              // Redirigir al usuario a una página de acceso denegado o a la página de inicio
              console.warn('Acceso denegado: El usuario no es administrador.');
              return this.router.createUrlTree(['/access-denied']); // O '/home'
            }
          })
        );
      }
    }