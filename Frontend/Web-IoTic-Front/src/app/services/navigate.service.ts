import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common'; // Agregar este import

@Injectable({
  providedIn: 'root'
})
export class NavigateService {
  public router = inject(Router);
    private location = inject(Location);
  navigateTo(path: string) {
    this.router.navigate([path]);
  }

    // Historial del navegador
  goBack() {
    this.location.back();
  }

  goForward() {
    this.location.forward();
  }

  // Recargar página actual
  reload() {
    window.location.reload();
  }

  // Obtener ruta actual
  getCurrentRoute(): string {
    return this.router.url;
  }
  // Navegación con parámetros
  navigateWithParams(path: string, params: any = {}) {
    this.router.navigate([path], { queryParams: params });
  }
    // Navegación condicional basada en autenticación
  navigateIfAuthenticated(path: string, fallbackPath: string = '/login') {
    // Aquí podrías inyectar tu AuthService
    // if (this.authService.isAuthenticated()) {
    //   this.navigateTo(path);
    // } else {
    //   this.navigateTo(fallbackPath);
    // }
  }

}
