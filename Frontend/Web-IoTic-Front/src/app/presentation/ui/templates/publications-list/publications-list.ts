import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { UserProductivityItem } from '../../../../services/information/user-productivity.service';

@Component({
  selector: 'app-publications-list',
  imports: [CommonModule],
  templateUrl: './publications-list.html',
  styleUrl: './publications-list.css'
})
export class PublicationsList {
  @Input() publications: UserProductivityItem[] = [];
  @Input() showTitle: boolean = true; // Controla si se muestra el título
  @Output() publicationClick = new EventEmitter<{ id: number; tipo: string }>();

  constructor(private router: Router) {}

  getImageUrl(publication: UserProductivityItem): string {
    return publication.image_r2 && publication.image_r2.trim() !== ''
      ? publication.image_r2
      : 'assets/img/item-placeholder.svg';
  }

  onPublicationClick(publication: UserProductivityItem): void {
    if (publication.id) {
      this.publicationClick.emit({ id: publication.id, tipo: publication.tipo });
    }
  }

  /**
   * Navega a la página de edición del elemento
   */
  goToEdit(event: Event, publication: UserProductivityItem): void {
    event.stopPropagation();
    if (publication.id && publication.tipo) {
      this.router.navigate(['/productividad/editar', publication.tipo, publication.id]);
    }
  }
}

