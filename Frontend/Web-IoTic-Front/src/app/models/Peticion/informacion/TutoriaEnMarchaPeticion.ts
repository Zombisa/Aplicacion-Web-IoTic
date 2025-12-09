export interface TutoriaEnMarchaPeticion {
  titulo: string;
  subtipoTitulo: string;
  tipoProductividad: string;
  descripcion: string;
  pais: string;
  anio: number;
  orientados: string[];
  programa: string;
  institucion: string;
  autores: string[];
  etiquetasGTI: string[];
  licencia: string;
  image_r2?: string | null;
  file_r2?: string | null;
}