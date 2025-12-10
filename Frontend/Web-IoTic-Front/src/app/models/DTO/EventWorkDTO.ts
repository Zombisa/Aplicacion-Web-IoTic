import { EventWorkPeticion } from "../Peticion/EventWorkPeticion";

export interface EventWorkDTO extends EventWorkPeticion {
    id: number;
    usuario: number;
}

