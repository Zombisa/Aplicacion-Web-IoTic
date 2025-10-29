import { Pipe, PipeTransform } from '@angular/core';
import { ElectronicComponent } from '../models/electronicComponent.model';

@Pipe({
  name: 'filterInventory',
  standalone: true
})
export class FilterInventoryPipe implements PipeTransform {
  transform(
    list: ElectronicComponent[],
    filtro: { nombre?: string; estado?: string }
  ): ElectronicComponent[] {
    if (!list) return [];

    const nombre = (filtro?.nombre || '').toLowerCase().trim();
    const estado = (filtro?.estado || '').toLowerCase().trim();

    return list.filter(d => {
      //  Filtro de texto general (numSerie, descripción, ubicación, observación)
      const coincideTexto =
        !nombre ||
        d.descripcion?.toLowerCase().includes(nombre) ||
        d.numSerie?.toLowerCase().includes(nombre) ||
        d.ubicacion?.toLowerCase().includes(nombre) ||
        d.observacion?.toLowerCase().includes(nombre);

      //  Filtro de estado (físico o administrativo)
      const coincideEstado =
        !estado ||
        d.estadoFisico?.toLowerCase().includes(estado) ||
        d.estadoAdministrativo?.toLowerCase().includes(estado);

      return coincideTexto && coincideEstado;
    });
  }
}
