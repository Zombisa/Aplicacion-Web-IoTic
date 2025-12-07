import { ItemDTO } from './ItemDTO';

export interface LoanDTO {
  id: number;
  nombre_persona: string;
  item: ItemDTO;              // relación directa
  fecha_prestamo: string;     // o Date
  fecha_devolucion: string | null;   // o Date | null
  fecha_limite?: string;
  estado: string;
  correo?: string;
  telefono?: string;
  cedula?: string;
  direccion?: string;
}
