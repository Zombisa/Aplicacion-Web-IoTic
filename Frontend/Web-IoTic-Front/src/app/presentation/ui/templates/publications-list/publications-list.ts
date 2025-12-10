import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UserProductivityItem } from '../../../../services/information/user-productivity.service';

@Component({
  selector: 'app-publications-list',
  imports: [CommonModule],
  templateUrl: './publications-list.html',
  styleUrl: './publications-list.css'
})
export class PublicationsList {
  @Input() publications: UserProductivityItem[] = [];
  @Output() publicationClick = new EventEmitter<{ id: number; tipo: string }>();

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
}

