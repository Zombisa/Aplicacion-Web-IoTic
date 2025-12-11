import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface MaterialDidacticoDTO extends BaseProductivityDTO {
  id: number;
  usuario: number;
  descripcion: string;
  etiquetasGTI: string[];
  licencia: string;
  fechaPublicacion: string;
}