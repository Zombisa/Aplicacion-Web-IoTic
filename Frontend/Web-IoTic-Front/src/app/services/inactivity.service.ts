import { Injectable, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Subject, Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';

/**
 * Servicio para detectar inactividad del usuario y cerrar sesión automáticamente
 * después de 5 minutos de inactividad.
 */
@Injectable({
  providedIn: 'root'
})
export class InactivityService implements OnDestroy {
  private readonly INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos en milisegundos
  private inactivityTimer: any = null;
  private activitySubject = new Subject<void>();
  private subscriptions: Subscription[] = [];
  private isTracking = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeActivityTracking();
    }
  }

  /**
   * Inicializa el seguimiento de actividad del usuario
   */
  private initializeActivityTracking(): void {
    // Eventos que indican actividad del usuario
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      const subscription = new Subscription();
      const handler = () => this.resetInactivityTimer();
      
      document.addEventListener(event, handler, { passive: true });
      
      subscription.add(() => {
        document.removeEventListener(event, handler);
      });
      
      this.subscriptions.push(subscription);
    });
  }

  /**
   * Reinicia el timer de inactividad
   */
  private resetInactivityTimer(): void {
    // Solo reiniciar si estamos en modo de seguimiento
    if (!this.isTracking) {
      return;
    }

    // Limpiar timer anterior
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    // Crear nuevo timer
    this.inactivityTimer = setTimeout(() => {
      this.handleInactivity();
    }, this.INACTIVITY_TIMEOUT);
  }

  /**
   * Maneja la inactividad del usuario cerrando la sesión
   */
  private async handleInactivity(): Promise<void> {
    console.warn('⏰ Sesión cerrada por inactividad (5 minutos)');
    
    // Cerrar sesión
    try {
      await this.authService.logout();
      
      // Limpiar cualquier dato local
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('token');
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      
      // Redirigir al login
      this.router.navigate(['/login'], {
        queryParams: { reason: 'inactivity' }
      });
    } catch (error) {
      console.error('Error al cerrar sesión por inactividad:', error);
    }
  }

  /**
   * Inicia el seguimiento de inactividad (llamar después del login)
   */
  public startTracking(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isTracking = true;
      this.resetInactivityTimer();
    }
  }

  /**
   * Detiene el seguimiento de inactividad (llamar en logout)
   */
  public stopTracking(): void {
    this.isTracking = false;
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  /**
   * Limpia recursos al destruir el servicio
   */
  ngOnDestroy(): void {
    this.stopTracking();
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }
}
