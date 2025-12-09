import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { TutoriaEnMarchaDTO } from "../../models/DTO/informacion/TutoriaEnMarchaDTO";
import { TutoriaEnMarchaPeticion } from "../../models/Peticion/informacion/TutoriaEnMarchaPeticion";
import { ApiService } from "../common/api.service";

@Injectable({
  providedIn: 'root'
})
export class TutoriaEnMarchaService {

  private readonly basePath = 'tutoriaEnMarcha';

  constructor(private api: ApiService) {}

  getAll(): Observable<TutoriaEnMarchaDTO[]> {
    return this.api.get<TutoriaEnMarchaDTO[]>(`${this.basePath}/tutorias_en_marcha/`);
  }

  getById(id: number): Observable<TutoriaEnMarchaDTO> {
    return this.api.get<TutoriaEnMarchaDTO>(`${this.basePath}/${id}/`);
  }

  create(payload: TutoriaEnMarchaPeticion): Observable<TutoriaEnMarchaDTO> {
    return this.api.post<TutoriaEnMarchaDTO>(`${this.basePath}/tutoria_en_marcha/`, payload);
  }

  update(id: number, payload: TutoriaEnMarchaPeticion): Observable<TutoriaEnMarchaDTO> {
    return this.api.put<TutoriaEnMarchaDTO>(`${this.basePath}/${id}/tutoria_en_marcha/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}/tutoria_en_marcha/`);
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