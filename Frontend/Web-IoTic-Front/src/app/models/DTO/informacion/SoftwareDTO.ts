import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface SoftwareDTO extends BaseProductivityDTO {
  id: number;
  tituloDesarrollo: string;
  etiquetas: string[];
  nivelAcceso: string;
  tipoProducto: string;
  responsable: string[];
  codigoRegistro?: string | null;
  descripcionFuncional: string;
  propiedadIntelectual: string;
  fechaPublicacion: string;
}