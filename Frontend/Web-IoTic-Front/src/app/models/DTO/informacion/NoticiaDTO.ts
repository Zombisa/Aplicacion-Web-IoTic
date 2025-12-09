import { BaseProductivityDTO } from "../../Common/BaseProductivityDTO";

export interface NoticiaDTO extends BaseProductivityDTO {
  id: number;
  contenido: string;
  fecha_publicacion: string;
}