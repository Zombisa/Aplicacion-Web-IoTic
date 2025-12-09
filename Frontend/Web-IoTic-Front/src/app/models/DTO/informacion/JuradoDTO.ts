export interface JuradoDTO {
  id: number;
  usuario: number;
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
  fechaPublicacion: string;
  imaage_r2?: string | null;
  file_r2?: string | null;
}