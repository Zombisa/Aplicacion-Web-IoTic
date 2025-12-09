export interface ParticipacionComitesEvPeticion {
  titulo: string;
  pais: string;
  anio: number;
  institucion: string;
  tipoProductividad: string;
  autores: string[];
  etiquetasGTI: string[];
  licencia: string;
  image_r2?: string | null;
  file_r2?: string | null;
}