import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminOrMentorGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.currentUser.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          console.warn('Usuario no autenticado, redirigiendo al login...');
          return of(this.router.createUrlTree(['/login']));
        }
        return this.authService.isAdminOrMentor().pipe(
          map(isAdminOrMentor => {
            if (isAdminOrMentor) {
              return true;
            } else {
              console.warn('Acceso denegado: se requiere rol de administrador o mentor.');
              return this.router.createUrlTree(['/home']);
            }
          })
        );
      })
    );
  }
}

