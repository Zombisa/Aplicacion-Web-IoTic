import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDTO } from '../../../../models/DTO/UserDTO';
import { UserProductivityItem } from '../../../../services/information/user-productivity.service';
import { PublicationsList } from '../publications-list/publications-list';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mentor-publications-card',
  standalone: true,
  imports: [CommonModule, PublicationsList],
  templateUrl: './mentor-publications-card.html',
  styleUrls: ['./mentor-publications-card.css']
})
export class MentorPublicationsCard {
  @Input() mentor!: UserDTO;
  @Input() publications: UserProductivityItem[] = [];
  @Input() isLoading: boolean = false;

  constructor(private router: Router) {}

  getFullName(): string {
    if (!this.mentor) return '';
    return `${this.mentor.nombre} ${this.mentor.apellido}`.trim() || this.mentor.email;
  }

  onPublicationClick(event: { id: number; tipo: string }): void {
    const routeMap: { [key: string]: string } = {
      'libro': 'libros',
      'capitulo': 'capitulos',
      'curso': 'cursos',
      'evento': 'trabajo-eventos',
      'revista': 'revistas',
      'software': 'software',
      'tutoria-concluida': 'tutorias_concluidas',
      'tutoria-en-marcha': 'tutorias_en_marcha',
      'trabajo-eventos': 'trabajo-eventos',
      'participacion-comites': 'comites',
      'material-didactico': 'material-didactico',
      'jurado': 'jurado',
      'proceso-tecnica': 'proceso-tecnica'
    };

    const routePath = routeMap[event.tipo] || 'productividad';
    this.router.navigate(['/productividad', routePath, event.id]);
  }

  goToUserProfile(): void {
    if (this.mentor && this.mentor.id) {
      this.router.navigate(['/usuarios/view', this.mentor.id]);
    }
  }
}

