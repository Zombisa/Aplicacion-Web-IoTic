import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface RevistaPeticion extends BaseProductivityDTO {
  issn: number;
  volumen: number;
  fasc: number;
  linkDescargaArticulo?: string | null;
  linksitioWeb?: string | null;
  paginas: number;
  responsable: string[];
}
