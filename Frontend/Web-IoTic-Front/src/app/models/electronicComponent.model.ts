export type EstadoFisico = 'Excelente' | 'Bueno' | 'Regular' | 'Defectuoso' | 'Dañado' | 'En mantenimiento' | 'Obsoleto';
export type EstadoAdministrativo = 'Disponible' | 'Prestado' | 'Reservado' |'Asignado' |'Dado de baja';

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
