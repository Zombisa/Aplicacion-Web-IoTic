import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface RevistaDTO extends BaseProductivityDTO {
  id: number;
  issn: number;
  volumen: number;
  fasc: number;
  linkDescargaArticulo?: string | null;
  linksitioWeb?: string | null;
  paginas: number;
  responsable: string[];
}