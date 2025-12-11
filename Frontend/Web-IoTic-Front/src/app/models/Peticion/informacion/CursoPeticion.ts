import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface CursoPeticion extends BaseProductivityDTO{
  etiquetas: string[];
  propiedadIntelectual: string;
  duracion: number;
  institucion: string;
  link?: string | null;
}
