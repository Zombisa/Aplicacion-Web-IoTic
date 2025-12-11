import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface TutoriaEnMarchaDTO extends BaseProductivityDTO {
  id: number;
  usuario: number;
  subtipoTitulo: string;
  descripcion: string;
  orientados: string[];
  programa: string;
  institucion: string;
  etiquetasGTI: string[];
  licencia: string;
  fechaPublicacion: string;
}