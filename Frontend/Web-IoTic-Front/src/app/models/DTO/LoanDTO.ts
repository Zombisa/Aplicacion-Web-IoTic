import { ItemDTO } from './ItemDTO';

export interface LoanDTO {
  id: number;
  nombre_persona: string;
  item: ItemDTO;              // 👈 relación directa
  fecha_prestamo: string;     // o Date
  fecha_devolucion: string;   // o Date | null
  estado: string;
}
