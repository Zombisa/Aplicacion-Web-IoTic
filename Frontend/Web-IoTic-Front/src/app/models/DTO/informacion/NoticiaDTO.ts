export interface NoticiaDTO {
  id: number;
  titulo: string;
  contenido: string;
  fecha_publicacion: string;
  usuario: number;
  image_r2?: string | null;
  file_r2?: string | null;
}