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
  imports: [CommonModule, MatIconModule, RouterLink, RouterLinkActive],
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
  
  visibleSections = computed(() => {
    const isAuthenticated = this.isLoggedIn();
    const isAdmin = this.isAdmin();

    return [
      { path: '/home', icon: 'home', label: 'Inicio', show: true },
      { path: '/grupos', icon: 'groups', label: 'Grupos', show: isAuthenticated },
      { path: '/proyectos', icon: 'widgets', label: 'Proyectos', show: isAuthenticated },
      { path: '/usuarios', icon: 'people', label: 'Quienes somos', show: isAdmin },
      { path: '/login', icon: 'person', label: 'Perfil', show: isAuthenticated }
    ];
  });

  constructor() {
    // Suscribirse al estado de autenticación
    this.subscription.add(
      this.authService.isLoggedIn$.subscribe(loggedIn => {
        this.isLoggedIn.set(loggedIn);
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
}