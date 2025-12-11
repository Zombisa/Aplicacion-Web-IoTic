import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface ParticipacionComitesEvPeticion extends BaseProductivityDTO {
  institucion: string;
  etiquetasGTI: string[];
  licencia: string;
}