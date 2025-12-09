import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { TutoriaConcluidaDTO } from "../../models/DTO/informacion/TutoriaConcluidaDTO";
import { TutoriaConcluidaPeticion } from "../../models/Peticion/informacion/TutoriaConcluidaPeticion";
import { ApiService } from "../common/api.service";

@Injectable({
  providedIn: 'root'
})
export class TutoriaConcluidaService {

  private readonly basePath = 'tutoriaConcluida';

  constructor(private api: ApiService) {}

  getAll(): Observable<TutoriaConcluidaDTO[]> {
    return this.api.get<TutoriaConcluidaDTO[]>(`${this.basePath}/tutorias_concluidas/`);
  }

  getById(id: number): Observable<TutoriaConcluidaDTO> {
    return this.api.get<TutoriaConcluidaDTO>(`${this.basePath}/${id}/`);
  }

  create(payload: TutoriaConcluidaPeticion): Observable<TutoriaConcluidaDTO> {
    return this.api.post<TutoriaConcluidaDTO>(`${this.basePath}/tutoria_concluida/`, payload);
  }

  update(id: number, payload: TutoriaConcluidaPeticion): Observable<TutoriaConcluidaDTO> {
    return this.api.put<TutoriaConcluidaDTO>(`${this.basePath}/${id}/tutoria_concluida/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}/tutoria_concluida/`);
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