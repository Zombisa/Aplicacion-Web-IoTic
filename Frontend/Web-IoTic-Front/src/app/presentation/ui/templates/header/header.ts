import { CommonModule, NgIf } from '@angular/common';
import { Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { combineLatest } from 'rxjs';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [CommonModule, MatIconModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnDestroy {
  public router = inject(Router);
  private authService = inject(AuthService);
  private subscription = new Subscription();

  // Signals para el estado del usuario
  isLoggedIn = signal<boolean>(false);
  userName = signal<string | null>(null);
  isAdmin = signal<boolean>(false);
  userClaims = signal<{ [key: string]: any } | null>(null);
  hasAuthenticatedUser = signal<boolean>(false);
  
  // Signals para inactividad
  inactivityWarning = signal<{ show: boolean; timeLeft: number }>({ show: false, timeLeft: 0 });
  inactivityTimeout = signal<number>(15); // 15 minutos por defecto
  
  visibleSections = computed(() => {
    const isAuthenticated = this.isLoggedIn();
    const isAdmin = this.isAdmin();

    return [
      { path: '/home', icon: 'home', label: 'Inicio', show: true },
      { path: '/grupos', icon: 'groups', label: 'Grupos', show: true },
      { path: '/proyectos', icon: 'widgets', label: 'Proyectos', show: true},
      { path: '/usuarios', icon: 'people', label: 'Quienes somos', show: true},
      { path: '/login', icon: 'person', label: 'Perfil', show: true }
    ];
  });

  constructor() {
    // Suscribirse al estado de autenticación
    this.subscription.add(
      this.authService.isLoggedIn$.subscribe(loggedIn => {
        this.isLoggedIn.set(loggedIn);
        this.hasAuthenticatedUser.set(loggedIn);
      })
    );

    // Suscribirse al usuario actual para verificar autenticación real
    this.subscription.add(
      this.authService.currentUser.subscribe(user => {
        const isAuthenticated = !!user;
        this.hasAuthenticatedUser.set(isAuthenticated);
        this.isLoggedIn.set(isAuthenticated);
      })
    );

    // Suscribirse al nombre del usuario
    this.subscription.add(
      this.authService.name.subscribe(name => {
        this.userName.set(name);
      })
    );

    // Suscribirse al estado de admin
    this.subscription.add(
      this.authService.isAdmin().subscribe(admin => {
        this.isAdmin.set(admin);
      })
    );

    // Suscribirse a los claims del usuario
    this.subscription.add(
      this.authService.getUserClaims().subscribe(claims => {
        this.userClaims.set(claims);
      })
    );

    // Suscribirse al estado de advertencia de inactividad
    this.subscription.add(
      this.authService.warningStatus$.subscribe(warning => {
        this.inactivityWarning.set(warning);
      })
    );

    // Obtener timeout de inactividad
    this.inactivityTimeout.set(this.authService.inactivityTimeout);
    
    // Verificar estado inicial de autenticación
    this.checkAuthenticationStatus();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  async logout() {
    try {
      await this.authService.logout();
      // Actualizar el estado local
      this.hasAuthenticatedUser.set(false);
      this.isLoggedIn.set(false);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  canAccess(requiredClaim?: string): boolean {
    if (!this.isLoggedIn()) return false;
    if (!requiredClaim) return true;
    return true; // Implementar lógica según necesites
  }

  extendSession() {
    this.authService.extendSession();
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Método para verificar si hay un usuario realmente autenticado
  private checkAuthenticationStatus() {
    // Verificar el estado actual de autenticación
    const authState = this.authService.getCurrentAuthState();
    this.hasAuthenticatedUser.set(authState.isLoggedIn);
    this.isLoggedIn.set(authState.isLoggedIn);
    this.isAdmin.set(authState.isAdmin);
    this.userName.set(authState.name);
    this.userClaims.set(authState.claims);
  }
}