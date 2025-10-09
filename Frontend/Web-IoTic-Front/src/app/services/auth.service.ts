import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, User, authState, getIdTokenResult } from '@angular/fire/auth';
import { Observable, BehaviorSubject, firstValueFrom, from } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import {Firestore, doc, getDoc, collection, getDocs, setDoc} from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private role$ = new BehaviorSubject<string | null>(null);
  private name$ = new BehaviorSubject<string | null>(null);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor(private afAuth: Auth, private firestore: Firestore, private http: HttpClient, private injector: Injector) {
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
      } else {
        this.role$.next(null);
        this.name$.next(null);
      }
    });
  }

  async login(email: string, password: string) {
    await runInInjectionContext(this.injector, async () => {
      await signInWithEmailAndPassword(this.afAuth, email, password);
    });
  }

  async fetchCurrentUserFromBackend() {
    const token = await this.getToken();
    console.log('Token obtenido de Firebase:', token); 
  
    const url = `${environment.apiBaseUrl}/auth/me`;
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
   * Check if the user is logged in
   */
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
    return signOut(this.afAuth);
  }
  /**
   * Get the current user's ID token
   */
  async getToken(): Promise<string | null> {
    // Try to get the current user immediately
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
  /**
   * Receive the user for map to TeacherDTO
   *
   */
}