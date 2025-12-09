import { Observable } from "rxjs";
import { ApiService } from "../common/api.service";
import { Injectable } from "@angular/core";
import { ParticipacionComitesEvDTO } from "../../models/DTO/informacion/ParticipacionComitesEvDTO";
import { ParticipacionComitesEvPeticion } from "../../models/Peticion/informacion/ParticipacionComitesEvPeticion";

@Injectable({
  providedIn: 'root'
})
export class ParticipacionComitesEvService {

  private readonly basePath = 'informacion/participacionComitesEv';

  constructor(private api: ApiService) {}

  getAll(): Observable<ParticipacionComitesEvDTO[]> {
    return this.api.get<ParticipacionComitesEvDTO[]>(`${this.basePath}/listar_comites_ev/`);
  }

  getById(id: number): Observable<ParticipacionComitesEvDTO> {
    return this.api.get<ParticipacionComitesEvDTO>(`${this.basePath}/${id}/`);
  }

  create(payload: ParticipacionComitesEvPeticion): Observable<ParticipacionComitesEvDTO> {
    return this.api.post<ParticipacionComitesEvDTO>(`${this.basePath}/comite_ev/`, payload);
  }

  update(id: number, payload: ParticipacionComitesEvPeticion): Observable<ParticipacionComitesEvDTO> {
    return this.api.put<ParticipacionComitesEvDTO>(`${this.basePath}/${id}/comite_ev/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}/comite_ev/`);
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