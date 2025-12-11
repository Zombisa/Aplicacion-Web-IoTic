import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface EventoDTO extends BaseProductivityDTO {
  id: number;
  etiquetas: string[];
  autores: string[];
  propiedadIntelectual: string;
  alcance: string;
  institucion: string;
  fechaPublicacion: string;
}