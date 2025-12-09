import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../common/api.service';
import { NoticiaDTO } from '../../models/DTO/informacion/NoticiaDTO';
import { NoticiaPeticion } from '../../models/Peticion/informacion/NoticiaPeticion ';

@Injectable({
  providedIn: 'root'
})
export class NoticiaService {

  private readonly basePath = 'noticia';

  constructor(private api: ApiService) {}

  getAll(): Observable<NoticiaDTO[]> {
    return this.api.get<NoticiaDTO[]>(`${this.basePath}/noticias/`);
  }

  getById(id: number): Observable<NoticiaDTO> {
    return this.api.get<NoticiaDTO>(`${this.basePath}/${id}/`);
  }

  create(payload: NoticiaPeticion): Observable<NoticiaDTO> {
    return this.api.post<NoticiaDTO>(`${this.basePath}/noticia/`, payload);
  }

  update(id: number, payload: NoticiaPeticion): Observable<NoticiaDTO> {
    return this.api.put<NoticiaDTO>(`${this.basePath}/${id}/noticia/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}/noticia/`);
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