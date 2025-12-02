import { ItemDTO } from './ItemDTO';

export interface LoanHistoryDTO {
  id: number;
  nombre_persona: string;
  item: ItemDTO;
  fecha_prestamo: string;
  fecha_devolucion: string | null;
  fecha_limite?: string;
  estado: string;
  correo?: string;
  telefono?: string;
  cedula?: string;
  direccion?: string;
}


