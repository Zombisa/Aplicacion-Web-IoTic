import { BaseProductivityDTO } from "../Common/BaseProductivityDTO";

export interface CapBookPeticion extends BaseProductivityDTO {
    isbn: string;
    volumen: string;
    paginas: number;
    editorial: string;
    codigoEditorial: number;
    propiedadIntelectual: string;
    numeroCapitulo: number;
    nombreCapitulo: string;
}