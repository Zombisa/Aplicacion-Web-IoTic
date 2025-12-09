export interface SoftwareDTO {
  id: number;
  usuario: number;
  tituloDesarrollo: string;
  tipoProductividad: string;
  etiquetas: string[];
  nivelAcceso: string;
  tipoProducto: string;
  pais: string;
  responsable: string[];
  codigoRegistro?: string | null;
  descripcionFuncional: string;
  propiedadIntelectual: string;
  fechaPublicacion: string;
  image_r2?: string | null;
  file_r2?: string | null;
}