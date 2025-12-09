export interface MaterialDidacticoPeticion {
  titulo: string;
  tipoProductividad: string;
  pais: string;
  anio: number;
  descripcion: string;
  autores: string[];
  etiquetasGTI: string[];
  licencia: string;
  image_r2?: string | null;
  file_r2?: string | null;
}