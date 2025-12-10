import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BaseProductivityDTO } from '../../../../models/Common/BaseProductivityDTO';

@Component({
  selector: 'app-section-info-productivity',
  imports: [CommonModule],
  templateUrl: './section-info-productivity.html',
  styleUrl: './section-info-productivity.css'
})
export class SectionInfoProductivity {
  @Input() item!: BaseProductivityDTO & any; // Permite extender con campos específicos
  @Input() itemImageUrl: string = 'assets/img/item-placeholder.svg';
  @Input() tipo: string = ''; // Tipo de productividad para personalizar la visualización

  getImageUrl(): string {
    return this.item?.image_r2 && this.item.image_r2.trim() !== ''
      ? this.item.image_r2
      : this.itemImageUrl;
  }

  hasLink(): boolean {
    return !!(this.item?.link && this.item.link.trim() !== '');
  }

  openLink(): void {
    if (this.hasLink()) {
      window.open(this.item.link, '_blank');
    }
  }
}

