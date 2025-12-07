import { ItemDTO } from './ItemDTO';

export interface LoanDTO {
  id: number;
  nombre_persona: string;
  cedula: string;
  telefono: string;
  correo: string;
  direccion: string;
  fecha_prestamo: string;          // ISO date string
  fecha_limite: string;            // ISO date string
  fecha_devolucion: string ; // pued3e ser null
  estado: string;
  item: ItemDTO;
}
