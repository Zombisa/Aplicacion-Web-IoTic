import { BookPeticion } from "../Peticion/BookPeticion";

export interface BookDTO extends BookPeticion{
    id: number;
    usuario: number;
}