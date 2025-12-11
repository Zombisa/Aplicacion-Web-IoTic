import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface TutoriaEnMarchaPeticion extends BaseProductivityDTO {
  subtipoTitulo: string;
  tipoProductividad: string;
  descripcion: string;
  orientados: string[];
  programa: string;
  institucion: string;
  etiquetasGTI: string[];
  licencia: string;
}