import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface CursoDTO extends BaseProductivityDTO {
  id: number;
  etiquetas: string[];
  autores: string[];
  propiedadIntelectual: string;
  duracion: number;
  institucion: string;
  fechaPublicacion: string; // ISO string
  link?: string | null;
}