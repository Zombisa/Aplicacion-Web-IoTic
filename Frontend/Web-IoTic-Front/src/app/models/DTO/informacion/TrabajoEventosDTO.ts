import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface TrabajoEventosDTO extends BaseProductivityDTO {
  id: number;
  volumen: number;
  nombreSeminario: string;
  tipoPresentacion: string;
  tituloActas: string;
  isbn: number;
  paginas: number;
  etiquetas: string[];
  propiedadIntelectual: string;
}