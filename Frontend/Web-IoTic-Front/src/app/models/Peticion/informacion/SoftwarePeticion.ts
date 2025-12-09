import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface SoftwarePeticion extends BaseProductivityDTO {
  tituloDesarrollo: string;
  etiquetas: string[];
  nivelAcceso: string;
  tipoProducto: string;
  responsable: string[];
  codigoRegistro?: string | null;
  descripcionFuncional: string;
  propiedadIntelectual: string;
}
