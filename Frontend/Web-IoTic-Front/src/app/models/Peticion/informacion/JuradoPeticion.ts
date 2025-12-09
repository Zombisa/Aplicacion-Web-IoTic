import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface JuradoPeticion extends BaseProductivityDTO{
  orientados: string[];
  programa: string;
  institucion: string;
  etiquetas: string[];
  licencia: string;
}