import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface ProcesoTecnicaPeticion extends BaseProductivityDTO {
  etiquetasGTI: string[];
  licencia: string;
}