export interface TrabajoEventosDTO {
  id: number;
  usuario: number;
  titulo: string;
  tipoProductividad: string;
  volumen: number;
  nombreSeminario: string;
  tipoPresentacion: string;
  tituloActas: string;
  isbn: number;
  paginas: number;
  anio: number;
  etiquetas: string[];
  propiedadIntelectual: string;
  autores: string[];
  image_r2?: string | null;
  file_r2?: string | null;
}