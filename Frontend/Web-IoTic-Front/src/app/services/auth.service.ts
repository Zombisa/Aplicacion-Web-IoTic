import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, User, authState, getIdTokenResult } from '@angular/fire/auth';
import { Observable, BehaviorSubject, firstValueFrom, from, Subscription } from 'rxjs';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
import {Firestore, doc, getDoc, collection, getDocs, setDoc} from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { InactivityService } from './inactivity.service';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private role$ = new BehaviorSubject<string | null>(null);
  private name$ = new BehaviorSubject<string | null>(null);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private inactivitySubscription?: Subscription;

  constructor(
    private afAuth: Auth, 
    private firestore: Firestore, 
    private http: HttpClient, 
    private injector: Injector,
    private inactivityService: InactivityService
  ) {
    // Escucha cambios de usuario y actualiza datos adicionales y usuario actual
    authState(this.afAuth).subscribe(async (user) => {
      this.currentUserSubject.next(user);
      if (user) {
        const docSnap = await runInInjectionContext(this.injector, () => getDoc(doc(this.firestore, 'usuarios', user.uid)));
        if (docSnap.exists()) {
          const data = docSnap.data();
          this.role$.next(data['role'] ?? null);
          this.name$.next(data['name'] ?? null);
        } else {
          this.role$.next(null);
          this.name$.next(null);
        }
        
        // Iniciar timer de inactividad cuando el usuario se loguea
        this.startInactivityTimer();
      } else {
        this.role$.next(null);
        this.name$.next(null);
        
        // Detener timer de inactividad cuando el usuario se desloguea
        this.stopInactivityTimer();
      }
    });

    // Suscribirse al logout automático por inactividad
    this.setupInactivityLogout();
  }

  async login(email: string, password: string): Promise<{ success: boolean; errorType?: string; errorMessage?: string; blocked?: boolean; retryAfter?: number }> {
    try {
      // Validar email antes de intentar autenticación
      if (!email || !email.includes('@')) {
        return {
          success: false,
          errorType: 'invalid_email',
          errorMessage: 'El formato del correo electrónico no es válido'
        };
      }

      // Validar contraseña
      if (!password || password.length < 6) {
        return {
          success: false,
          errorType: 'weak_password',
          errorMessage: 'La contraseña debe tener al menos 6 caracteres'
        };
      }

      await runInInjectionContext(this.injector, async () => {
        await signInWithEmailAndPassword(this.afAuth, email, password);
      });
      
      // Log successful authentication
      await this.logAuthenticationAttempt(email, true);
      
      return { success: true };
    } catch (error: any) {
      let errorType = 'other';
      let errorMessage = 'Error desconocido';
      
      // Parse Firebase error codes to specific error types
      switch (error.code) {
        case 'auth/user-not-found':
          errorType = 'user_not_found';
          errorMessage = 'El usuario no existe. Verifica tu correo electrónico.';
          break;
        case 'auth/wrong-password':
          errorType = 'wrong_password';
          errorMessage = 'Contraseña incorrecta. Intenta nuevamente.';
          break;
        case 'auth/invalid-email':
          errorType = 'invalid_email';
          errorMessage = 'El formato del correo electrónico no es válido.';
          break;
        case 'auth/invalid-credential':
          errorType = 'invalid_credential';
          errorMessage = 'Las credenciales son incorrectas. Verifica tu correo electrónico y contraseña.';
          break;
        case 'auth/user-disabled':
          errorType = 'account_disabled';
          errorMessage = 'Tu cuenta ha sido deshabilitada. Contacta al administrador.';
          break;
        case 'auth/too-many-requests':
          errorType = 'too_many_attempts';
          errorMessage = 'Demasiados intentos. Intenta más tarde.';
          break;
        case 'auth/email-not-verified':
          errorType = 'email_not_verified';
          errorMessage = 'Debes verificar tu correo electrónico antes de iniciar sesión.';
          break;
        case 'auth/account-locked':
          errorType = 'account_locked';
          errorMessage = 'Tu cuenta ha sido bloqueada por seguridad.';
          break;
        default:
          errorMessage = error.message || 'Error de autenticación';
      }
      
      try {
        // Log failed authentication
        await this.logAuthenticationAttempt(email, false, errorType, errorMessage);
      } catch (logError: any) {
        // Si el error es por IP bloqueada, devolver información específica
        if (logError.message === 'IP_BLOCKED') {
          return {
            success: false,
            errorType: 'ip_blocked',
            errorMessage: 'Tu IP ha sido bloqueada temporalmente por demasiados intentos fallidos. Intenta más tarde.',
            blocked: true,
            retryAfter: 900 // 15 minutos
          };
        }
      }
      
      return { 
        success: false, 
        errorType, 
        errorMessage 
      };
    }
  }

  private async logAuthenticationAttempt(email: string, success: boolean, errorType?: string, errorMessage?: string) {
    try {
      // Generar session ID único para esta sesión
      const sessionId = this.getOrCreateSessionId();
      
      const logData = {
        email: email.toLowerCase().trim(),
        success,
        error_type: errorType || 'other',
        error_message: errorMessage || '',
        session_id: sessionId
      };
      
      const response = await firstValueFrom(
        this.http.post(`${environment.apiUrl}/auth/log-attempt`, logData)
      );
      
      // Verificar si la IP está bloqueada
      if (response && 'blocked' in response && response.blocked) {
        throw new Error('IP_BLOCKED');
      }
      
      console.log('Log de autenticación registrado:', response);
    } catch (error: any) {
      console.error('Error al registrar log de autenticación:', error);
      
      // Si es error de IP bloqueada, relanzar el error
      if (error.message === 'IP_BLOCKED') {
        throw error;
      }
    }
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('auth_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('auth_session_id', sessionId);
    }
    return sessionId;
  }

  async fetchCurrentUserFromBackend() {
    const token = await this.getToken();
    console.log('Token obtenido de Firebase:', token); 
  
    const url = `${environment.apiUrl}/auth/me`;
    if (token) {
      return firstValueFrom(
        this.http.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
    }
    console.warn('No se obtuvo token, enviando sin Authorization header');
    return firstValueFrom(this.http.get(url));
  }
  

  get isLoggedIn$(): Observable<boolean> {
    return this.currentUserSubject.asObservable().pipe(
      (source) => new Observable(subscriber => {
        source.subscribe(user => subscriber.next(!!user));
      })
    );
  }

  get currentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  // Método síncrono para obtener el usuario actual (si lo necesitas)
  getCurrentUser(): User | null {
    return this.afAuth.currentUser;
  }
  /**
 * Obtiene los custom claims del usuario autenticado desde Firebase.
 * 
 * Retorna un observable que emite un objeto con los claims (roles, permisos, etc.)
 * o null si no hay usuario autenticado.
 * 
 * Utiliza el observable del usuario actual y llama a getIdTokenResult(user, true)
 * para obtener los claims actualizados del token JWT de Firebase.
 *
 * @returns Observable<{ [key: string]: any } | null>
 */
  getUserClaims(): Observable<{ [key: string]: any } | null> {
    return this.currentUser.pipe(
      filter((user): user is User => !!user),
      switchMap(user => from(getIdTokenResult(user, true))),
      map(idTokenResult => idTokenResult.claims)
    );
  }
  get name(): Observable<string | null> {
    return this.name$.asObservable();
  }

  isAdmin(): Observable<boolean> {
        return this.getUserClaims().pipe(
          map(claims => !!(claims && claims['admin'] === true))
        );
  }
  get uid(): Observable<string | null> {
    return this.currentUser.pipe(
      filter((user): user is User => user !== null),
      (source) => new Observable(subscriber => {
        source.subscribe(user => subscriber.next(user.uid));
      })
    );
  }
  logout() {
    this.stopInactivityTimer();
    return signOut(this.afAuth);
  }

  // Métodos para manejar inactividad
  private startInactivityTimer() {
    this.inactivityService.startInactivityTimer();
  }

  private stopInactivityTimer() {
    this.inactivityService.stopInactivityTimer();
  }

  private setupInactivityLogout() {
    this.inactivitySubscription = this.inactivityService.logoutTrigger$.subscribe(shouldLogout => {
      if (shouldLogout) {
        this.handleInactivityLogout();
      }
    });
  }

  private async handleInactivityLogout() {
    try {
      // Log del logout por inactividad
      const currentUser = this.afAuth.currentUser;
      if (currentUser) {
        await this.logAuthenticationAttempt(
          currentUser.email || 'unknown', 
          false, 
          'inactivity_logout', 
          'Sesión cerrada por inactividad'
        );
      }
      
      // Realizar logout
      await this.logout();
      
      // Mostrar notificación (opcional)
      console.log('Sesión cerrada por inactividad');
    } catch (error) {
      console.error('Error durante logout por inactividad:', error);
    }
  }

  // Método público para extender la sesión
  extendSession() {
    this.inactivityService.extendSession();
  }

  // Getters para el estado de inactividad
  get inactivityStatus$(): Observable<boolean> {
    return this.inactivityService.inactivityStatus$;
  }

  get warningStatus$(): Observable<{ show: boolean; timeLeft: number }> {
    return this.inactivityService.warningStatus$;
  }

  get inactivityTimeout(): number {
    return this.inactivityService.getInactivityTimeout();
  }

  get warningTime(): number {
    return this.inactivityService.getWarningTime();
  }

  async getToken(): Promise<string | null> {
    const immediateUser = await this.afAuth.currentUser;
    if (immediateUser) {
      return immediateUser.getIdToken(true); // force refresh to avoid stale/empty tokens
    }

    // Fallback: wait until the auth state emits a user
    const user = await firstValueFrom(
      this.currentUser.pipe(
        filter((u): u is User => u !== null)
      )
    );
    return user.getIdToken(true);
  }
}