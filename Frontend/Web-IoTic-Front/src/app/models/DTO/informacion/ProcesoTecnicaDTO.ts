import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface ProcesoTecnicaDTO extends BaseProductivityDTO {
  id: number;
  usuario: number;
  etiquetasGTI: string[];
  licencia: string;
  fechaPublicacion: string;
}