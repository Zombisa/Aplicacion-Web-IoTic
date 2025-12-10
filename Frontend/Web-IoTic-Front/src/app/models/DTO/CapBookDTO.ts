import { BaseProductivityDTO } from "../Common/BaseProductivityDTO";


export interface CapBookDTO extends BaseProductivityDTO {
    id: number;
    isbn: string;
    volumen: string;
    paginas: number;
    editorial: string;
    codigoEditorial: number;
    propiedadIntelectual: string;
    numeroCapitulo: number;
    nombreCapitulo: string;
}