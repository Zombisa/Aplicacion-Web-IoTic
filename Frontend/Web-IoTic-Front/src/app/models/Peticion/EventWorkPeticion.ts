import { BaseProductivityDTO } from "../Common/BaseProductivityDTO";

export interface EventWorkPeticion extends BaseProductivityDTO {
    volumen: number;
    nombreSeminario: string;
    tipoPresentacion: string;
    tituloActas: string;
    isbn: number;
    paginas: number;
    etiquetas: string[];
    propiedadIntelectual: string;
}

