import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs/internal/Observable';
import { map, switchMap, take } from 'rxjs';

    @Injectable({
      providedIn: 'root'
    })
    export class AdminGuard implements CanActivate {

      constructor(private authService: AuthService, private router: Router) {}

      canActivate(): Observable<boolean | UrlTree> {
        return this.authService.currentUser.pipe(
          take(1),
          switchMap(user => {
            if (!user) {
              console.warn('Usuario no autenticado, redirigiendo al login...');
              return [this.router.createUrlTree(['/login'])];
            }
            return this.authService.isAdmin().pipe(
              map(isAdmin => {
                if (isAdmin) {
                  return true;
                } else {
                  console.warn('Acceso denegado: no es administrador.');
                  return this.router.createUrlTree(['/access-denied']);
                }
              })
            );
          })
        );
      }
    }