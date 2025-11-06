export type EstadoFisico = 'Excelente' | 'Bueno' | 'Dañado';
export type EstadoAdministrativo = 'Disponible' | 'Prestado' |'Dado de baja' | 'No prestable';

export interface ElectronicComponent {
  id: number;
  numSerie: string;
  descripcion: string;
  cantidad: number;
  ubicacion: string;
  estadoFisico: EstadoFisico;
  estadoAdministrativo: EstadoAdministrativo;
  observacion: string;
  imagenArticulo: string;
}
