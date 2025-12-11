import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from './common/app-config.service';
import { RegistroFotograficoDTO } from '../models/DTO/RegistroFotograficoDTO';
import { RegistroFotograficoPeticion } from '../models/Peticion/RegistroFotograficoPeticion';

@Injectable({
  providedIn: 'root'
})
export class RegistroFotograficoService {

  constructor(
    private http: HttpClient,
    private appConfig: AppConfigService
  ) {}

  private get baseUrl(): string {
    return `${this.appConfig.apiUrlBackend}informacion/registrosFotograficos/`;
  }

  /** LISTAR todos los registros (GET /registrosFotograficos/) */
  getAll(): Observable<RegistroFotograficoDTO[]> {
    return this.http.get<RegistroFotograficoDTO[]>(this.baseUrl);
  }

  /** OBTENER detalle por id (GET /registrosFotograficos/:id/) */
  getById(id: number): Observable<RegistroFotograficoDTO> {
    return this.http.get<RegistroFotograficoDTO>(`${this.baseUrl}${id}/`);
  }

  /** CREAR registro (POST /registrosFotograficos/) 
   *  body debe llevar mínimo: file_path
   */
  create(payload: RegistroFotograficoPeticion): Observable<RegistroFotograficoDTO> {
    return this.http.post<RegistroFotograficoDTO>(this.baseUrl, payload);
  }

  /** ACTUALIZAR parcial (PATCH /registrosFotograficos/:id/) 
   *  Puedes mandar también un nuevo file_path si cambias la foto
   */
  update(id: number, payload: Partial<RegistroFotograficoPeticion>): Observable<RegistroFotograficoDTO> {
    return this.http.patch<RegistroFotograficoDTO>(`${this.baseUrl}${id}/`, payload);
  }

  /** ELIMINAR (DELETE /registrosFotograficos/:id/) */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}/`);
  }
}
