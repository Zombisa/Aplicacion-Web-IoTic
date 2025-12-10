import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { SectionInfoProductivity } from '../../templates/section-info-productivity/section-info-productivity';
import { LoadingService } from '../../../../services/loading.service';
import { EventoService } from '../../../../services/information/evento.service';
import { EventoDTO } from '../../../../models/DTO/informacion/EventoDTO';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-evento',
  imports: [CommonModule, Header, LoadingPage, SectionInfoProductivity],
  templateUrl: './view-evento.html',
  styleUrl: './view-evento.css'
})
export class ViewEvento implements OnInit {
  private eventoId!: number;
  public evento!: EventoDTO;
  public eventoImageUrl: string = 'assets/img/item-placeholder.svg';

  constructor(
    private eventoService: EventoService,
    private activatedRoute: ActivatedRoute,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.eventoId = Number(params.get('id'));
      console.log('ID del evento obtenido de la URL:', this.eventoId);
      this.getEventoById();
    });
  }

  getEventoById(): void {
    this.loadingService.show();
    console.log('Obteniendo el evento con ID:', this.eventoId);
    this.eventoService.getById(this.eventoId).subscribe({
      next: (evento) => {
        this.evento = evento;
        console.log('Evento obtenido:', this.evento);
        const posibleImagen = this.evento.image_r2;
        this.eventoImageUrl =
          posibleImagen && posibleImagen.trim() !== ''
            ? posibleImagen
            : 'assets/img/item-placeholder.svg';
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener el evento:', error);
        this.loadingService.hide();
        Swal.fire(
          'Error',
          'No se pudo cargar la información del evento.',
          'error'
        ).then(() => {
          this.router.navigate(['/productividad']);
        });
      }
    });
  }
}

