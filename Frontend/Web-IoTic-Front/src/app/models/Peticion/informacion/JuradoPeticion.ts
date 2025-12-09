export interface JuradoPeticion {
  titulo: string;
  tipoProductividad: string;
  pais: string;
  anio: number;
  orientados: string[];
  programa: string;
  institucion: string;
  autores: string[];
  etiquetas: string[];
  licencia: string;
  image_r2?: string | null;
  file_r2?: string | null;
}