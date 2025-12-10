import { BaseProductivityDTO } from "../Common/BaseProductivityDTO";

export interface CoursePeticion extends BaseProductivityDTO {
    duracion: number;
    institucion: string;
    link?: string;
    etiquetas: string[];
    propiedadIntelectual: string;
}

