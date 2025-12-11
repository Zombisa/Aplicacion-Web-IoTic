import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface ParticipacionComitesEvDTO extends BaseProductivityDTO {
  id: number;
  usuario: number;
  institucion: string;
  etiquetasGTI: string[];
  licencia: string;
  fechaPublicacion: string;
}