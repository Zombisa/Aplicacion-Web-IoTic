import { CommonModule, NgIf } from '@angular/common';
import { Component, computed, inject, signal, OnDestroy, OnInit } from '@angular/core';
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
export class Header implements OnInit, OnDestroy {
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
      { path: '/who-we-are', icon: 'groups', label: 'Quienes somos', show: true },
      { path: '/productividad', icon: 'widgets', label: 'Proyectos', show: true},
      { path: '/inventario', icon: 'inventory_2', label: 'Inventario', show: isAdmin },
      { path: '/mentores-publicaciones', icon: 'people', label: 'Mentores', show: true},
      { path: '/user', icon: 'person', label: 'Perfil', show: true }
    ];
  });

  constructor() {}

  ngOnInit(): void {
    // Suscribirse al estado de autenticación
    this.subscription.add(
      this.authService.currentUser.subscribe(user => {
        this.isLoggedIn.set(!!user);
        this.hasAuthenticatedUser.set(!!user);
        if (user) {
          this.userName.set(user.displayName || user.email || null);
        } else {
          this.userName.set(null);
          this.isAdmin.set(false);
        }
      })
    );

    // Suscribirse al estado de admin
    this.subscription.add(
      this.authService.isAdmin().subscribe(isAdmin => {
        this.isAdmin.set(isAdmin);
      })
    );
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

 

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Método para verificar si hay un usuario realmente autenticado
  
}