export interface BaseProductivityDTO {
  titulo:string;
  tipoProductividad: string;
  pais: string;
  anio: string;
  autores: string[];
  image_r2?: string; //DTO respuesta para la imagen
  file_r2?: string;   //DTO respuesta para el archivo
  image_path: string; //DTO peticion para la image
  archivo_path: string; //DTO peticion para el archivo
  usuario?: number; // ID del usuario que creó la productividad
}