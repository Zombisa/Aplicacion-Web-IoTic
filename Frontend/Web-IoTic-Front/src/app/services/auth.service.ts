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

      await runInInjectionContext(this.injector, async () => {
        const userCredential = await signInWithEmailAndPassword(this.afAuth, email, password);

        // Esperar a que el currentUserSubject emita
        await firstValueFrom(
          this.currentUser.pipe(
            filter(u => u !== null),
            timeout(5000)
          )
        );
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
   * Obtiene el token de ID del usuario autenticado.
   * @returns Una promesa que resuelve con el token de ID, o null si no hay usuario autenticado.
   */
  async getToken(): Promise<string | null> {
    try {
      if (!isPlatformBrowser(this.platformId) || !this.afAuth) {
        console.log('🚫 No está en navegador o Auth no está disponible');
        return null;
      }

      // Primero intentar obtener el usuario inmediatamente
      const immediateUser = this.afAuth.currentUser;
      if (immediateUser) {
        console.log('👤 Usuario inmediato encontrado, obteniendo token...');
        const token = await immediateUser.getIdToken(true);
        console.log('🔑 Token obtenido exitosamente:', token ? 'Sí' : 'No');
        return token;
      }

      // Si no hay usuario inmediato, esperar por el observable con timeout
      console.log('⏳ Esperando usuario del observable...');
      const user = await firstValueFrom(
        this.currentUser.pipe(
          filter((u): u is User => u !== null),
          timeout(3000) // 3 segundos timeout
        )
      );

      if (user) {
        console.log('👤 Usuario del observable encontrado, obteniendo token...');
        const token = await user.getIdToken(true);
        console.log('🔑 Token del observable obtenido:', token ? 'Sí' : 'No');
        return token;
      }

      console.warn('⚠️ No se encontró usuario autenticado');
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
      return null;
    }
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
  /*
  * Cierra la sesión del usuario actualmente autenticado.
  */
  logout() {
    if (!isPlatformBrowser(this.platformId) || !this.afAuth) {
      return Promise.resolve();
    }
    return signOut(this.afAuth);
  }
  /**
   * Método de debug para verificar el estado de autenticación
   */
  async debugAuthState(): Promise<void> {
    console.log('=== DEBUG AUTH STATE ===');
    console.log('Platform Browser:', isPlatformBrowser(this.platformId));
    console.log('Auth Service:', !!this.afAuth);
    console.log('Firestore Service:', !!this.firestore);
    
    if (this.afAuth) {
      const currentUser = this.afAuth.currentUser;
      console.log('Current User:', currentUser ? 'Sí' : 'No');
      
      if (currentUser) {
        console.log('User UID:', currentUser.uid);
        console.log('User Email:', currentUser.email);
        
        try {
          const token = await currentUser.getIdToken();
          console.log('Token disponible:', !!token);
          console.log('Token length:', token ? token.length : 0);
          console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'N/A');
        } catch (error) {
          console.error('Error obteniendo token:', error);
        }
      }
    }
    
    console.log('CurrentUserSubject value:', this.currentUserSubject.value ? 'Sí' : 'No');
    console.log('=== END DEBUG ===');
  }

}