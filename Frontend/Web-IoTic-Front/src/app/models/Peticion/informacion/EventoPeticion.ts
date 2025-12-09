import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface EventoPeticion extends BaseProductivityDTO{
  etiquetas: string[];
  propiedadIntelectual: string;
  alcance: string;
  institucion: string;
}
