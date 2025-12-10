import { CoursePeticion } from "../Peticion/CoursePeticion";

export interface CourseDTO extends CoursePeticion {
    id: number;
    usuario: number;
    fechaPublicacion: string;
}

