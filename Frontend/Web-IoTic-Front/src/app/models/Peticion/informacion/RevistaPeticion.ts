export interface RevistaPeticion {
  titulo: string;
  issn: number;
  volumen: number;
  fasc: number;
  linkDescargaArticulo?: string | null;
  linksitioWeb?: string | null;
  autores: string[];
  paginas: number;
  responsable: string[];
  image_r2?: string | null;
  file_r2?: string | null;
}
