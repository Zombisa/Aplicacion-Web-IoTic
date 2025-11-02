import { Pipe, PipeTransform } from '@angular/core';
import { ElectronicComponent } from '../models/electronicComponent.model';

@Pipe({
  name: 'filterInventory',
  standalone: true
})
export class FilterInventoryPipe implements PipeTransform {
  transform(
    list: ElectronicComponent[],
    filtro: { nombre?: string; estadoFisico?: string; estadoAdministrativo?: string }
  ): ElectronicComponent[] {
    if (!list || !Array.isArray(list)) return [];

    const nombre = (filtro?.nombre || '').toLowerCase().trim();
    const estadoFisico = (filtro?.estadoFisico || '').trim();
    const estadoAdministrativo = (filtro?.estadoAdministrativo || '').trim();

    // Si no hay filtros, devolver toda la lista
    if (!nombre && !estadoFisico && !estadoAdministrativo) {
      return list;
    }

    return list.filter(d => {
      // Filtro de texto general (numSerie, descripción, ubicación, observación)
      const coincideTexto = !nombre || 
        (d.descripcion?.toLowerCase().includes(nombre) ||
         d.numSerie?.toLowerCase().includes(nombre) ||
         d.ubicacion?.toLowerCase().includes(nombre) ||
         d.observacion?.toLowerCase().includes(nombre));

      // Filtro de estado físico (coincidencia exacta)
      const coincideEstadoFisico = !estadoFisico || d.estadoFisico === estadoFisico;

      // Filtro de estado administrativo (coincidencia exacta)
      const coincideEstadoAdministrativo = !estadoAdministrativo || d.estadoAdministrativo === estadoAdministrativo;

      return coincideTexto && coincideEstadoFisico && coincideEstadoAdministrativo;
    });
  }
}
