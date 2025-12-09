export interface CursoDTO {
  id: number;
  usuario: number;
  titulo: string;
  tipoProductividad: string;
  etiquetas: string[];
  autores: string[];
  propiedadIntelectual: string;
  duracion: number;
  institucion: string;
  fechaPublicacion: string; // ISO string
  link?: string | null;
  image_r2?: string | null;
}