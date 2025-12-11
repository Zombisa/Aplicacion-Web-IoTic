import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Header } from '../../templates/header/header';
import { GalleryRegistroFotografico } from '../../templates/gallery-registro-fotografico/gallery-registro-fotografico';
import { LoadingPage } from '../../components/loading-page/loading-page';

import { RegistroFotograficoDTO } from '../../../../models/DTO/RegistroFotograficoDTO';
import { RegistroFotograficoService } from '../../../../services/registro-fotografico.service';
import { LoadingService } from '../../../../services/loading.service';

@Component({
  selector: 'app-registro-fotografico-page',
  standalone: true,
  imports: [
    CommonModule,
    Header,
    GalleryRegistroFotografico,
    LoadingPage
  ],
  templateUrl: './registro-fotografico-page.html',
  styleUrls: ['./registro-fotografico-page.css']
})
export class RegistroFotograficoPage implements OnInit {

  registros: RegistroFotograficoDTO[] = [];

  constructor(
    private registroService: RegistroFotograficoService,
    public loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.cargarRegistros();
  }

  private cargarRegistros(): void {
    this.loadingService.show?.();      // si tu servicio tiene show()/hide()
    this.registroService.getAll().subscribe({
      next: regs => {
        this.registros = regs;
        this.loadingService.hide?.();
      },
      error: err => {
        console.error(err);
        this.loadingService.hide?.();
      }
    });
  }
}
