import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../../templates/header/header';

@Component({
  selector: 'app-user-page',
  imports: [Header, CommonModule],
  templateUrl: './user-page.html',
  styleUrl: './user-page.css'
})
export class UserPage {
  constructor(public router: Router) {}

  isAdmin() {
    throw new Error('Method not implemented.');
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
    
  visibleSections = computed(() => {
    const isAdmin = this.isAdmin();

    return [
      { path: '/home', icon: 'home', label: 'Inicio', show: true },
      { path: '/grupos', icon: 'groups', label: 'Grupos', show: true },
      { path: '/proyectos', icon: 'widgets', label: 'Proyectos', show: true},
      { path: '/usuarios', icon: 'people', label: 'Quienes somos', show: true},
      { path: '/login', icon: 'person', label: 'Perfil', show: true }
    ];
  });

}
