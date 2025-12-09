export interface EventoDTO {
  id: number;
  usuario: number;
  titulo: string;
  tipoProductividad: string;
  etiquetas: string[];
  autores: string[];
  propiedadIntelectual: string;
  alcance: string;
  institucion: string;
  fechaPublicacion: string;
  image_r2?: string | null;
}