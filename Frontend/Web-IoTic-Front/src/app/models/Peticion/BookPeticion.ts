import { BaseProductivityDTO } from "../Common/BaseProductivityDTO";

export interface BookPeticion extends BaseProductivityDTO {
    isbn: string;
    volumen: string;
    paginas: number;
    editorial: string;
    codigoEditorial: number;
    etiquetas: string[];
    propiedadIntelectual: string;
}