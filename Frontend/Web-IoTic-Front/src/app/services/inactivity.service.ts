import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private inactivityTimer: any;
  private warningTimer: any;
  private isWarningShown = false;
  
  // Configuración de tiempos (en milisegundos)
  private readonly INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos
  private readonly WARNING_TIME = 2 * 60 * 1000; // 2 minutos antes del logout
  
  // Subjects para comunicación
  private inactivitySubject = new BehaviorSubject<boolean>(false);
  private warningSubject = new BehaviorSubject<{ show: boolean; timeLeft: number }>({ show: false, timeLeft: 0 });
  private logoutSubject = new BehaviorSubject<boolean>(false);
  
  // Eventos que se consideran actividad
  private activityEvents = [
    'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'
  ];

  constructor() {
    this.setupActivityDetection();
  }

  private setupActivityDetection() {
    // Verificar que estamos en el navegador
    if (typeof document === 'undefined') {
      return;
    }

    // Crear observables para todos los eventos de actividad
    const activityObservables = this.activityEvents.map(event => 
      fromEvent(document, event)
    );

    // Combinar todos los eventos de actividad
    merge(...activityObservables)
      .pipe(
        debounceTime(1000), // Debounce para evitar demasiadas llamadas
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.resetInactivityTimer();
      });
  }

  private resetInactivityTimer() {
    // Verificar que estamos en el navegador
    if (typeof window === 'undefined') {
      return;
    }

    // Limpiar timers existentes
    this.clearTimers();
    
    // Resetear estado de advertencia
    this.isWarningShown = false;
    this.warningSubject.next({ show: false, timeLeft: 0 });
    this.inactivitySubject.next(false);

    // Configurar timer de advertencia
    this.warningTimer = setTimeout(() => {
      this.showWarning();
    }, this.INACTIVITY_TIMEOUT - this.WARNING_TIME);

    // Configurar timer de logout
    this.inactivityTimer = setTimeout(() => {
      this.triggerLogout();
    }, this.INACTIVITY_TIMEOUT);
  }

  private showWarning() {
    this.isWarningShown = true;
    this.warningSubject.next({ 
      show: true, 
      timeLeft: this.WARNING_TIME / 1000 // Convertir a segundos
    });
    
    // Iniciar countdown de la advertencia
    this.startWarningCountdown();
  }

  private startWarningCountdown() {
    // Verificar que estamos en el navegador
    if (typeof window === 'undefined') {
      return;
    }

    let timeLeft = this.WARNING_TIME / 1000;
    
    const countdownInterval = setInterval(() => {
      timeLeft -= 1;
      this.warningSubject.next({ 
        show: true, 
        timeLeft: Math.max(0, timeLeft)
      });
      
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
  }

  private triggerLogout() {
    this.logoutSubject.next(true);
    this.clearTimers();
  }

  private clearTimers() {
    // Verificar que estamos en el navegador
    if (typeof window === 'undefined') {
      return;
    }

    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  // Métodos públicos
  startInactivityTimer() {
    // Verificar que estamos en el navegador
    if (typeof window === 'undefined') {
      return;
    }
    this.resetInactivityTimer();
  }

  stopInactivityTimer() {
    // Verificar que estamos en el navegador
    if (typeof window === 'undefined') {
      return;
    }
    this.clearTimers();
    this.isWarningShown = false;
    this.warningSubject.next({ show: false, timeLeft: 0 });
    this.inactivitySubject.next(false);
  }

  extendSession() {
    // Verificar que estamos en el navegador
    if (typeof window === 'undefined') {
      return;
    }
    this.resetInactivityTimer();
  }

  // Getters para observables
  get inactivityStatus$(): Observable<boolean> {
    return this.inactivitySubject.asObservable();
  }

  get warningStatus$(): Observable<{ show: boolean; timeLeft: number }> {
    return this.warningSubject.asObservable();
  }

  get logoutTrigger$(): Observable<boolean> {
    return this.logoutSubject.asObservable();
  }

  // Configuración
  setInactivityTimeout(minutes: number) {
    // Esta función podría ser usada para cambiar el timeout dinámicamente
    // Por ahora mantenemos el valor fijo por simplicidad
  }

  getInactivityTimeout(): number {
    return this.INACTIVITY_TIMEOUT / 1000 / 60; // Devolver en minutos
  }

  getWarningTime(): number {
    return this.WARNING_TIME / 1000 / 60; // Devolver en minutos
  }
}
