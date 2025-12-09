import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EventoDTO } from '../../models/DTO/informacion/EventoDTO';
import { EventoPeticion } from '../../models/Peticion/informacion/EventoPeticion';
import { ApiService } from '../common/api.service';

@Injectable({
  providedIn: 'root'
})
export class EventoService {

  private readonly basePath = 'evento';

  constructor(private api: ApiService) {}

  getAll(): Observable<EventoDTO[]> {
    return this.api.get<EventoDTO[]>(`${this.basePath}/eventos/`);
  }

  getById(id: number): Observable<EventoDTO> {
    return this.api.get<EventoDTO>(`${this.basePath}/${id}/`);
  }

  create(payload: EventoPeticion): Observable<EventoDTO> {
    return this.api.post<EventoDTO>(`${this.basePath}/evento/`, payload);
  }

  update(id: number, payload: EventoPeticion): Observable<EventoDTO> {
    return this.api.put<EventoDTO>(`${this.basePath}/${id}/evento/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}/evento/`);
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