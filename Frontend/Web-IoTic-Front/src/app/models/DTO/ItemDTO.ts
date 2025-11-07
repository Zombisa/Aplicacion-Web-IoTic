export interface ItemDTO {
  id: number;
  numeroSerieActivo: number;
  descripcionArticulo: string;
  cantidad_disponible: number;
  cantidad_prestada: number;
  ubicacion: string;
  estadoFisico: string;
  estadoAdministrativo: string;
  observacion: string;
  fecha_registro: string; 
}