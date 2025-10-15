import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, User, authState, getIdTokenResult } from '@angular/fire/auth';
import { Observable, BehaviorSubject, firstValueFrom, from, Subscription } from 'rxjs';
import { filter, map, switchMap, takeUntil, debounceTime, distinctUntilChanged, take } from 'rxjs/operators';
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
  
  // Observables de debug para monitorear el estado
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  private userClaimsSubject = new BehaviorSubject<{ [key: string]: any } | null>(null);
  
  // Protección contra logout inmediato
  private lastLoginTime = 0;
  private readonly MIN_LOGIN_DURATION = 2000; // 2 segundos mínimo
  
  // Gestor de estado de autenticación
  private authStateManager = {
    isProcessing: false,
    lastProcessedUser: null as User | null,
    processingPromise: null as Promise<void> | null
  };

  constructor(
    private afAuth: Auth, 
    private firestore: Firestore, 
    private http: HttpClient, 
    private injector: Injector,
    private inactivityService: InactivityService
  ) {
    // Escucha cambios de usuario y actualiza datos adicionales y usuario actual
    authState(this.afAuth)
      .pipe(
        debounceTime(500), // Debounce más largo para evitar cambios rápidos
        distinctUntilChanged((prev, curr) => {
          // Solo procesar si el usuario realmente cambió
          const prevUid = prev?.uid || null;
          const currUid = curr?.uid || null;
          return prevUid === currUid;
        })
      )
      .subscribe((user) => {
        this.handleAuthStateChange(user);
      });

    // Suscribirse al logout automático por inactividad
    this.setupInactivityLogout();
  }

  private async handleAuthStateChange(user: User | null) {
    // Verificar si ya estamos procesando un cambio
    if (this.authStateManager.isProcessing) {
      console.log('Auth state change already processing, skipping...');
      return;
    }

    // Verificar si es el mismo usuario
    if (this.authStateManager.lastProcessedUser?.uid === user?.uid) {
      console.log('Same user, skipping processing...');
      return;
    }

    // Marcar como procesando
    this.authStateManager.isProcessing = true;
    this.authStateManager.lastProcessedUser = user;

    try {
      console.log('Auth State Changed:', user ? 'User logged in' : 'User logged out');
      console.log('User UID:', user?.uid || 'null');
      
      // Actualizar observables básicos
      this.currentUserSubject.next(user);
      this.isLoggedInSubject.next(!!user);

      if (user) {
        await this.handleUserLogin(user);
      } else {
        await this.handleUserLogout();
      }
    } catch (error) {
      console.error('Error handling auth state change:', error);
    } finally {
      this.authStateManager.isProcessing = false;
    }
  }

  private async handleUserLogin(user: User) {
    // Registrar tiempo de login
    this.lastLoginTime = Date.now();
    console.log('User details:', {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified
    });
    
    // Obtener datos adicionales de Firestore
    const docSnap = await runInInjectionContext(this.injector, () => getDoc(doc(this.firestore, 'usuarios', user.uid)));
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('Firestore user data:', data);
      this.role$.next(data['role'] ?? null);
      this.name$.next(data['name'] ?? null);
    } else {
      console.log('No Firestore document found for user - creating one');
      // Crear documento de usuario por defecto
      const defaultUserData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email?.split('@')[0] || 'Usuario',
        role: 'user', // Rol por defecto
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      try {
        await runInInjectionContext(this.injector, () => setDoc(doc(this.firestore, 'usuarios', user.uid), defaultUserData));
        console.log('User document created:', defaultUserData);
        this.role$.next(defaultUserData.role);
        this.name$.next(defaultUserData.name);
      } catch (error) {
        console.error('Error creating user document:', error);
        this.role$.next(null);
        this.name$.next(null);
      }
    }
    
    // Obtener claims del token JWT
    try {
      const idTokenResult = await runInInjectionContext(this.injector, () => getIdTokenResult(user, true));
      console.log('JWT Claims:', idTokenResult.claims);
      this.userClaimsSubject.next(idTokenResult.claims);
      
      // Verificar si es admin
      let isAdmin = !!(idTokenResult.claims && idTokenResult.claims['admin'] === true);
      
      // Fallback: verificar si el email contiene "admin"
      if (!isAdmin && user.email) {
        isAdmin = user.email.toLowerCase().includes('admin');
        console.log('Admin detected by email pattern:', isAdmin);
      }
      
      console.log('Is Admin:', isAdmin);
      this.isAdminSubject.next(isAdmin);
    } catch (error) {
      console.error('Error getting claims:', error);
      this.userClaimsSubject.next(null);
      this.isAdminSubject.next(false);
    }
    
    // Iniciar timer de inactividad cuando el usuario se loguea
    // TEMPORALMENTE DESHABILITADO PARA DEBUG
    // this.startInactivityTimer();
    console.log('AuthService: Inactivity timer disabled for debugging');
    
    // Log final del estado
    console.log('Final auth state:', {
      isLoggedIn: this.isLoggedInSubject.value,
      isAdmin: this.isAdminSubject.value,
      role: this.role$.value,
      name: this.name$.value
    });
  }

  private async handleUserLogout() {
    // Verificar si es un logout inmediato después del login
    const timeSinceLogin = Date.now() - this.lastLoginTime;
    const isImmediateLogout = timeSinceLogin < this.MIN_LOGIN_DURATION;
    
    if (isImmediateLogout) {
      console.log('BLOCKED: Immediate logout detected, ignoring...', {
        timeSinceLogin,
        minDuration: this.MIN_LOGIN_DURATION
      });
      return; // Ignorar el logout inmediato
    }
    
    console.log('User logged out - clearing all data');
    console.log('Logout reason - checking auth state:', {
      currentUser: this.currentUserSubject.value,
      isLoggedIn: this.isLoggedInSubject.value,
      timeSinceLogin,
      timestamp: new Date().toISOString()
    });
    this.role$.next(null);
    this.name$.next(null);
    this.userClaimsSubject.next(null);
    this.isAdminSubject.next(false);
    
    // Detener timer de inactividad cuando el usuario se desloguea
    this.stopInactivityTimer();
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
    return this.isLoggedInSubject.asObservable();
  }

  get currentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
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
    return this.userClaimsSubject.asObservable();
  }
  get name(): Observable<string | null> {
    return this.name$.asObservable();
  }

  // Métodos de debug para monitorear el estado
  get debugUserClaims$(): Observable<{ [key: string]: any } | null> {
    return this.userClaimsSubject.asObservable();
  }

  get debugIsAdmin$(): Observable<boolean> {
    return this.isAdminSubject.asObservable();
  }

  get debugIsLoggedIn$(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  // Método para obtener el estado actual de forma síncrona (para debug)
  getCurrentAuthState() {
    return {
      isLoggedIn: this.isLoggedInSubject.value,
      isAdmin: this.isAdminSubject.value,
      user: this.currentUserSubject.value,
      claims: this.userClaimsSubject.value,
      role: this.role$.value,
      name: this.name$.value
    };
  }

  isAdmin(): Observable<boolean> {
    return this.isAdminSubject.asObservable();
  }
  get uid(): Observable<string | null> {
    return this.currentUser.pipe(
      map(user => user?.uid || null)
    );
  }
  logout() {
    console.log('AuthService: Logout method called');
    this.stopInactivityTimer();
    return signOut(this.afAuth);
  }

  // Métodos para manejar inactividad
  private startInactivityTimer() {
    console.log('AuthService: Starting inactivity timer');
    this.inactivityService.startInactivityTimer();
  }

  private stopInactivityTimer() {
    console.log('AuthService: Stopping inactivity timer');
    this.inactivityService.stopInactivityTimer();
  }

  private setupInactivityLogout() {
    console.log('AuthService: Setting up inactivity logout subscription');
    this.inactivitySubscription = this.inactivityService.logoutTrigger$.subscribe(shouldLogout => {
      console.log('AuthService: Inactivity logout trigger received:', shouldLogout);
      if (shouldLogout) {
        this.handleInactivityLogout();
      }
    });
  }

  private async handleInactivityLogout() {
    try {
      console.log('AuthService: Handling inactivity logout');
      // Log del logout por inactividad
      const currentUser = this.afAuth.currentUser;
      if (currentUser) {
        console.log('AuthService: Logging inactivity logout for user:', currentUser.email);
        await this.logAuthenticationAttempt(
          currentUser.email || 'unknown', 
          false, 
          'inactivity_logout', 
          'Sesión cerrada por inactividad'
        );
      }
      
      // Realizar logout
      console.log('AuthService: Executing logout due to inactivity');
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