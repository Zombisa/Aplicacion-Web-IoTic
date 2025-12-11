import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RegistroFotograficoDTO } from '../../../../models/DTO/RegistroFotograficoDTO';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-gallery-registro-fotografico',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './gallery-registro-fotografico.html',
  styleUrls: ['./gallery-registro-fotografico.css']
})
export class GalleryRegistroFotografico {

  /** Lista de registros a mostrar */
  @Input() registros: RegistroFotograficoDTO[] = [];

  /** Muestra u oculta botones de acción (pensado para admin) */
  @Input() showActions: boolean = false;

  /**
   * Si quieres que al hacer click en la tarjeta navegue a un detalle,
   * puedes pasar la ruta base, por ejemplo: '/registro-fotografico/detalle'
   * y el componente hará routerLink="['/registro-fotografico/detalle', id]"
   */
  @Input() detailsBaseRoute?: string;

  /** Eventos para usar en páginas de admin */
  @Output() view = new EventEmitter<RegistroFotograficoDTO>();
  @Output() edit = new EventEmitter<RegistroFotograficoDTO>();
  @Output() remove = new EventEmitter<RegistroFotograficoDTO>();

  onCardClick(registro: RegistroFotograficoDTO): void {
    this.view.emit(registro);
  }

  onEdit(registro: RegistroFotograficoDTO, event: MouseEvent): void {
    event.stopPropagation();
    this.edit.emit(registro);
  }

  onDelete(registro: RegistroFotograficoDTO, event: MouseEvent): void {
    event.stopPropagation();
    this.remove.emit(registro);
  }

  /** Para armar el link al detalle si se usa detailsBaseRoute */
  getRouterLink(registro: RegistroFotograficoDTO): any[] | null {
    if (!this.detailsBaseRoute) return null;
    return [this.detailsBaseRoute, registro.id];
  }
}
