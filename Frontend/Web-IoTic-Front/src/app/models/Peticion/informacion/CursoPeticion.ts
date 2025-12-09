export interface CursoPeticion {
  titulo: string;
  tipoProductividad: string;
  etiquetas: string[];
  autores: string[];
  propiedadIntelectual: string;
  duracion: number;
  institucion: string;
  link?: string | null;
  image_r2?: string | null;
  file_r2?: string | null;
}
