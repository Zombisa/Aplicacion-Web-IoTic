import { ItemDTO } from './ItemDTO';

export interface LoanDTO {
  id: number;
  item: number;
  nombre_persona: string;
  cedula: string;
  telefono: string;
  correo: string;
  direccion: string;
  fecha_prestamo: string;          // ISO date string
  fecha_limite: string;            // ISO date string
  fecha_devolucion: string ; // puede ser null
  estado: string;
  foto_entrega: string;
  foto_devolucion: string ;  // puede ser null
  item_serial_snapshot: string;
  item_descripcion_snapshot: string;
  item_estado_fisico_snapshot: string;
  item_estado_admin_snapshot: string;
}
