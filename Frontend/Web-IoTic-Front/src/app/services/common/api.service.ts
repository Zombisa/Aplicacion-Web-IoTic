import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private config: AppConfigService
  ) {}

  private buildUrl(path: string): string {
    const base = this.config.apiUrlBackend.replace(/\/+$/, '');
    const rel = path.replace(/^\/+/, '');
    return `${base}/${rel}`;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return new HttpHeaders(headers);
  }

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(this.buildUrl(path), {
      headers: this.getAuthHeaders()
    });
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(this.buildUrl(path), body, {
      headers: this.getAuthHeaders()
    });
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(this.buildUrl(path), body, {
      headers: this.getAuthHeaders()
    });
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.buildUrl(path), {
      headers: this.getAuthHeaders()
    });
  }
}