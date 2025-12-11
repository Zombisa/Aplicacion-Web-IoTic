import { Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, Observable, take } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.currentUser.pipe(
      take(1),
      map(user => {
        if (user) {
          return true; 
        } else {
          console.warn('Usuario no autenticado, redirigiendo al login...');
          return this.router.createUrlTree(['/login']); 
        }
      })
    );
  }
}