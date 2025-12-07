import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { EvaluationCommitteeDTO } from '../../models/DTO/evaluation-committeeDTO';
import { EvaluationCommitteePeticion } from '../../models/Peticion/evaluation-committeePeticion';

@Injectable({
  providedIn: 'root'
})
export class EvaluationCommitteesService {

  private baseUrl = `${environment.apiUrl}/participacionComitesEv`; 
  
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAll(): Observable<EvaluationCommitteeDTO[]> {
    return this.http.get<EvaluationCommitteeDTO[]>(`${this.baseUrl}/listar_comites_ev/`, {
      headers: this.getHeaders()
    });
  }

  getById(id: number): Observable<EvaluationCommitteeDTO> {
    return this.http.get<EvaluationCommitteeDTO>(`${this.baseUrl}/${id}/`, {
      headers: this.getHeaders()
    });
  }

  create(data: EvaluationCommitteePeticion): Observable<EvaluationCommitteeDTO> {
    return this.http.post<EvaluationCommitteeDTO>(`${this.baseUrl}/agregar_comite_ev/`, data, {
      headers: this.getHeaders()
    });
  }

  update(id: number, data: EvaluationCommitteePeticion): Observable<EvaluationCommitteeDTO> {
    return this.http.put<EvaluationCommitteeDTO>(`${this.baseUrl}/${id}/editar_comite_ev/`, data, {
      headers: this.getHeaders()
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/eliminar_comite_ev/`, {
      headers: this.getHeaders()
    });
  }
}