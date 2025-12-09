import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface TutoriaConcluidaDTO extends BaseProductivityDTO {
  id: number;
  usuario: number;
  orientados: string[];
  programa: string;
  institucion: string;
  etiquetasGTI: string[];
  licencia: string;
  fechaPublicacion: string;
}