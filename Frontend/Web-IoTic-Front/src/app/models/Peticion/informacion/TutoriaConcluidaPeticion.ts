import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface TutoriaConcluidaPeticion extends BaseProductivityDTO {
  orientados: string[];
  programa: string;
  institucion: string;
  etiquetasGTI: string[];
  licencia: string;
}
