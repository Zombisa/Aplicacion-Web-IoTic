import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDTO } from '../../../../models/DTO/UserDTO';

@Component({
  selector: 'app-section-info-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-info-user.html',
  styleUrls: ['./section-info-user.css']
})
export class SectionInfoUser {
  @Input() user?: UserDTO;
  @Input() mode: 'view' | 'edit' = 'view';

  @Output() functionEmitter = new EventEmitter<string>();

  getEstadoClass(): string {
    if (!this.user) return '';
    if (this.user.estado) {
      return 'box-state';
    } else {
      return 'box-state bad-warning';
    }
  }

  getEstadoText(): string {
    if (!this.user) return '';
    return this.user.estado ? 'Activo' : 'Inactivo';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  onEdit(): void {
    this.functionEmitter.emit('edit');
  }

  onDelete(): void {
    this.functionEmitter.emit('delete');
  }
}
