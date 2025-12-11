export interface ItemDTO {
  id: number;
  serial: string;
  descripcion: string;
  estado_fisico: string;
  estado_admin: string;
  fecha_registro: string; 
  observacion: string;
  image_r2?: string;
  file_path: string;
}