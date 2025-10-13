import { Component, computed } from '@angular/core';
import { Header } from '../../templates/header/header';

@Component({
  selector: 'app-user-page',
  imports: [Header],
  templateUrl: './user-page.html',
  styleUrl: './user-page.css'
})
export class UserPage {
  isAdmin() {
    throw new Error('Method not implemented.');
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
