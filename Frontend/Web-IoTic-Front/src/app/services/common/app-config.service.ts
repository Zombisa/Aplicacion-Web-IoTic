import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
   private settings: any;

  constructor(private http: HttpClient) {}

  async load(): Promise<void> {
    this.settings = await firstValueFrom(
      this.http.get('/assets/config/config.json')
    );
  }

  get apiUrlBackend(): string {
    return this.settings?.apiUrlBackend ?? '';
  }
}
