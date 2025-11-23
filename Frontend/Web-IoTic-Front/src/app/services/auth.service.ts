import { Injectable, Injector, runInInjectionContext, Inject, PLATFORM_ID, Optional } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, User, authState, getIdTokenResult } from '@angular/fire/auth';
import { Observable, BehaviorSubject, firstValueFrom, from, EMPTY, timeout } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import {Firestore, doc, getDoc, collection, getDocs, setDoc} from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';

import { isPlatformBrowser } from '@angular/common';
import { environment } from '../environment/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  // Cache del token para evitar llamadas innecesarias a Firebase
  private cachedToken: string | null = null;
  private tokenExpiry: number | null = null;
  private tokenPromise: Promise<string | null> | null = null;

  constructor(
    @Optional() private afAuth: Auth, 
    @Optional() private firestore: Firestore, 
    private http: HttpClient, 
    private injector: Injector,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Solo inicializar Firebase en el navegador
    if (isPlatformBrowser(this.platformId) && this.afAuth) {
      authState(this.afAuth).subscribe(async (user) => {
        this.currentUserSubject.next(user);
        if (user && this.firestore) {
          const docSnap = await runInInjectionContext(this.injector, () => getDoc(doc(this.firestore, 'usuarios', user.uid)));
          if (docSnap.exists()) {
            const data = docSnap.data();
          }
        } else {
        }
      });
    }
  }
  /**
   * Maneja el inicio de sesión del usuario con correo y contraseña.
   * @param email correo electrónico del usuario
   * @param password contraseña del usuario 
   */
  async login(email: string, password: string) {
    if (!isPlatformBrowser(this.platformId) || !this.afAuth) {
      throw new Error('Authentication is not available on server side');
    }

    // Limpiar cache antes del login
    this.clearTokenCache();

    await runInInjectionContext(this.injector, async () => {
      const userCredential = await signInWithEmailAndPassword(this.afAuth, email, password);

      // Esperar a que el currentUserSubject emita el nuevo usuario
      await firstValueFrom(
        this.currentUser.pipe(
          filter(u => u !== null),
          timeout(5000)
        )
      );

      console.log('✅ Login exitoso para:', userCredential.user.email);
    });
  }

  /**
   * Consulta al backend los datos del usuario actualmente autenticado.
   * @returns Los datos del usuario actual obtenidos desde el backend
   */
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
  /**
   * Observable que emite true si el usuario está autenticado, false en caso contrario.
   */
  get isLoggedIn$(): Observable<boolean> {
    return this.currentUserSubject.pipe(map(user => !!user));
  }
  /**
   * Observable que trae el usuario actualmente autenticado, o null si no hay ninguno.
   */
  get currentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }
  /**
   * Observable que emite el UID del usuario autenticado, o null si no hay ninguno.
   */
  get uid(): Observable<string | null> {
    return this.currentUser.pipe(map(user => user?.uid ?? null));
  }
  /**
   *  Obtiene los claims personalizados del usuario autenticado.
   * @returns Un observable que emite los claims personalizados del usuario autenticado, o null si no hay ninguno.
   */
  getUserClaims(): Observable<{ [key: string]: any } | null> {
    if (!isPlatformBrowser(this.platformId) || !this.afAuth) {
      return EMPTY;
    }
    return this.currentUser.pipe(
      filter((user): user is User => !!user),
      switchMap(user => from(getIdTokenResult(user, true))),
      map(idTokenResult => idTokenResult.claims)
    );
  }
  /**
   * Obtiene el token de ID del usuario autenticado con cache inteligente
   * - Usa cache mientras el token no esté próximo a expirar
   * - Evita múltiples llamadas concurrentes a Firebase
   * - Refresca automáticamente tokens expirados
   */
  async getToken(): Promise<string | null> {
    if (!isPlatformBrowser(this.platformId) || !this.afAuth) {
      console.log('🚫 No está en navegador o Auth no disponible');
      return null;
    }

    const now = Date.now();
    
    // 1. Verificar cache válido (30 segundos antes de expirar)
    if (this.cachedToken && this.tokenExpiry && now < (this.tokenExpiry - 30000)) {
      console.log('💾 Usando token cacheado válido');
      return this.cachedToken;
    }

    // 2. Si ya hay una petición en curso, esperarla (evita múltiples llamadas)
    if (this.tokenPromise) {
      console.log('⏳ Esperando petición de token en curso...');
      return this.tokenPromise;
    }

    // 3. Crear nueva petición de token
    console.log('🔄 Obteniendo nuevo token de Firebase...');
    this.tokenPromise = this.fetchFreshToken();

    try {
      const token = await this.tokenPromise;
      return token;
    } finally {
      // Limpiar la promesa al completar (exitosa o con error)
      this.tokenPromise = null;
    }
  }

  /**
   * Método privado para obtener un token fresco de Firebase
   */
  private async fetchFreshToken(): Promise<string | null> {
    try {
      // Obtener usuario actual
      let user = this.afAuth.currentUser;
      
      if (!user) {
        console.log('👤 Usuario no encontrado inmediatamente, esperando...');
        user = await firstValueFrom(
          this.currentUser.pipe(
            filter((u): u is User => u !== null),
            timeout(5000)
          )
        );
      }

      if (!user) {
        console.warn('⚠️ No hay usuario autenticado');
        this.clearTokenCache();
        return null;
      }

      // Obtener token con información de expiración
      console.log('🔑 Obteniendo token del usuario:', user.uid);
      const idTokenResult = await user.getIdTokenResult(true); // force refresh
      
      // Actualizar cache
      this.cachedToken = idTokenResult.token;
      this.tokenExpiry = new Date(idTokenResult.expirationTime).getTime();
      
      console.log('✅ Token obtenido y cacheado exitosamente');
      console.log('📅 Expira en:', new Date(this.tokenExpiry).toLocaleString());
      
      return this.cachedToken;

    } catch (error) {
      console.error('❌ Error obteniendo token fresco:', error);
      this.clearTokenCache();
      return null;
    }
  }

  /**
   * Limpia el cache del token
   */
  private clearTokenCache(): void {
    this.cachedToken = null;
    this.tokenExpiry = null;
    this.tokenPromise = null;
  }

  /**
   * Invalida el token cache manualmente (útil en logout o errores 401)
   */
  public invalidateTokenCache(): void {
    console.log('🗑️ Cache de token invalidado manualmente');
    this.clearTokenCache();
  }

  /**
   * Verifica si el token actual está próximo a expirar (menos de 2 minutos)
   */
  public isTokenNearExpiry(): boolean {
    if (!this.tokenExpiry) return true;
    const now = Date.now();
    const twoMinutes = 2 * 60 * 1000;
    return now > (this.tokenExpiry - twoMinutes);
  }
  /**
   * 
   * @returns Un observable que emite true si el usuario tiene el rol de admin, false en caso contrario.
   */
  isAdmin(): Observable<boolean> {
        return this.getUserClaims().pipe(
          map(claims => !!(claims && claims['admin'] === true))
        );
  }
  /**
   * Cierra la sesión del usuario actualmente autenticado.
   */
  logout() {
    if (!isPlatformBrowser(this.platformId) || !this.afAuth) {
      return Promise.resolve();
    }
    
    // Limpiar cache antes del logout
    this.clearTokenCache();
    console.log('🚪 Cerrando sesión y limpiando cache...');
    
    return signOut(this.afAuth);
  }
  /**
   * Método de debug para verificar el estado de autenticación y cache
   */
  async debugAuthState(): Promise<void> {
    console.log('=== DEBUG AUTH STATE ===');
    console.log('Platform Browser:', isPlatformBrowser(this.platformId));
    console.log('Auth Service:', !!this.afAuth);
    console.log('Firestore Service:', !!this.firestore);
    
    // Estado del cache
    console.log('--- Cache Estado ---');
    console.log('Token en cache:', !!this.cachedToken);
    console.log('Token expiry:', this.tokenExpiry ? new Date(this.tokenExpiry).toLocaleString() : 'N/A');
    console.log('Promesa en curso:', !!this.tokenPromise);
    console.log('Token próximo a expirar:', this.isTokenNearExpiry());
    
    if (this.afAuth) {
      const currentUser = this.afAuth.currentUser;
      console.log('--- Usuario Firebase ---');
      console.log('Current User:', currentUser ? 'Sí' : 'No');
      
      if (currentUser) {
        console.log('User UID:', currentUser.uid);
        console.log('User Email:', currentUser.email);
        
        try {
          const token = await this.getToken(); // Usar método con cache
          console.log('Token disponible (con cache):', !!token);
          console.log('Token length:', token ? token.length : 0);
          console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'N/A');
        } catch (error) {
          console.error('Error obteniendo token:', error);
        }
      }
    }
    
    console.log('--- Observable Estado ---');
    console.log('CurrentUserSubject value:', this.currentUserSubject.value ? 'Sí' : 'No');
    console.log('=== END DEBUG ===');
  }

}