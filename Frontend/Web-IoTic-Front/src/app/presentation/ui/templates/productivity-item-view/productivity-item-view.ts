import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BaseProductivityDTO } from '../../../../models/Common/BaseProductivityDTO';

@Component({
  selector: 'app-productivity-item-view',
  imports: [CommonModule],
  templateUrl: './productivity-item-view.html',
  styleUrl: './productivity-item-view.css'
})
export class ProductivityItemView {
  @Input() item?: BaseProductivityDTO & { [key: string]: any };
  @Input() itemType: 'libro' | 'curso' | 'evento' | 'seminario' = 'libro';
  
  /**
   * Obtiene el primer autor o retorna un array vacío
   */
  getFirstAuthor(): string {
    return this.item?.autores && this.item.autores.length > 0 ? this.item.autores[0] : '';
  }

  /**
   * Obtiene todos los autores excepto el primero
   */
  getOtherAuthors(): string[] {
    return this.item?.autores && this.item.autores.length > 1 ? this.item.autores.slice(1) : [];
  }

  /**
   * Verifica si hay imagen disponible
   */
  hasImage(): boolean {
    return !!(this.item?.image_r2);
  }

  /**
   * Obtiene el valor de un campo o retorna string vacío
   */
  getFieldValue(field: string): string {
    return this.item?.[field] || '';
  }
}

