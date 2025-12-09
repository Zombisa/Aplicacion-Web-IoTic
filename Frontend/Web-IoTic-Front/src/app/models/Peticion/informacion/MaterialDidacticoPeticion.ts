import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface MaterialDidacticoPeticion extends BaseProductivityDTO{
  descripcion: string;
  etiquetasGTI: string[];
  licencia: string;
}