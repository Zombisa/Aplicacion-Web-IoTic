import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface JuradoDTO extends BaseProductivityDTO {
  id: number;
  orientados: string[];
  programa: string;
  institucion: string;
  etiquetas: string[];
  licencia: string;
  fechaPublicacion: string;
}