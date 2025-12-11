import { BaseProductivityDTO } from "../Common/BaseProductivityDTO";


export interface CapBookDTO extends BaseProductivityDTO {
    id: number;
    isbn: string;
    volumen: string;
    paginasFin: number;
    paginaInicio: number;
    editorial: string;
    codigoEditorial: number;
    propiedadIntelectual: string;
    numeroCapitulo: number;
    nombreCapitulo: string;
}