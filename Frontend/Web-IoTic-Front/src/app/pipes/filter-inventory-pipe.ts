import { Pipe, PipeTransform } from '@angular/core';
import { Device } from '../services/inventory.service';

@Pipe({
  name: 'filterInventory',
  standalone: true
})
export class FilterInventoryPipe implements PipeTransform {
  transform(list: Device[], filtro: { nombre?: string; categoria?: string; estado?: string }): Device[] {
    if (!list) return [];

    const nombre = (filtro?.nombre || '').toLowerCase().trim();
    const categoria = (filtro?.categoria || '').trim();
    const estado = (filtro?.estado || '').trim();

    return list.filter(d =>
      (!nombre || d.nombre.toLowerCase().includes(nombre)) &&
      (!estado || d.estado === estado)
    );
  }
}
