import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { TrabajoEventosDTO } from "../../models/DTO/informacion/TrabajoEventosDTO";
import { TrabajoEventosPeticion } from "../../models/Peticion/informacion/TrabajoEventosPeticion";
import { ApiService } from "../common/api.service";

@Injectable({
  providedIn: 'root'
})
export class TrabajoEventosService {

  private readonly basePath = 'trabajoEventos';

  constructor(private api: ApiService) {}

  getAll(): Observable<TrabajoEventosDTO[]> {
    return this.api.get<TrabajoEventosDTO[]>(`${this.basePath}/trabajos_eventos/`);
  }

  getById(id: number): Observable<TrabajoEventosDTO> {
    return this.api.get<TrabajoEventosDTO>(`${this.basePath}/${id}/`);
  }

  create(payload: TrabajoEventosPeticion): Observable<TrabajoEventosDTO> {
    return this.api.post<TrabajoEventosDTO>(`${this.basePath}/trabajo_evento/`, payload);
  }

  update(id: number, payload: TrabajoEventosPeticion): Observable<TrabajoEventosDTO> {
    return this.api.put<TrabajoEventosDTO>(`${this.basePath}/${id}/trabajo_evento/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}/trabajo_evento/`);
  }

  deleteImage(id: number): Observable<any> {
    return this.api.delete<any>(`${this.basePath}/${id}/imagen/`);
  }

  deleteFile(id: number): Observable<any> {
    return this.api.delete<any>(`${this.basePath}/${id}/archivo/`);
  }

  listImages(): Observable<string[]> {
    return this.api.get<string[]>(`${this.basePath}/imagenes/`);
  }
}