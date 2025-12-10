import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { LoadingService } from '../../../../services/loading.service';
import { TrabajoEventosService } from '../../../../services/information/trabajo-eventos.service';
import { TrabajoEventosDTO } from '../../../../models/DTO/informacion/TrabajoEventosDTO';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-trabajo-eventos',
  imports: [CommonModule, Header, LoadingPage],
  templateUrl: './view-trabajo-eventos.html',
  styleUrl: './view-trabajo-eventos.css'
})
export class ViewTrabajoEventos implements OnInit {
  private trabajoId!: number;
  public trabajo!: TrabajoEventosDTO;
  public trabajoImageUrl: string = 'assets/img/item-placeholder.svg';

  constructor(
    private trabajoService: TrabajoEventosService,
    private activatedRoute: ActivatedRoute,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.trabajoId = Number(params.get('id'));
      console.log('ID del trabajo obtenido de la URL:', this.trabajoId);
      this.getTrabajoById();
    });
  }

  getTrabajoById(): void {
    this.loadingService.show();
    console.log('Obteniendo el trabajo con ID:', this.trabajoId);
    this.trabajoService.getById(this.trabajoId).subscribe({
      next: (trabajo) => {
        this.trabajo = trabajo;
        console.log('Trabajo obtenido:', this.trabajo);
        const posibleImagen = this.trabajo.image_r2;
        this.trabajoImageUrl =
          posibleImagen && posibleImagen.trim() !== ''
            ? posibleImagen
            : 'assets/img/item-placeholder.svg';
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener el trabajo:', error);
        this.loadingService.hide();
        Swal.fire(
          'Error',
          'No se pudo cargar la información del trabajo.',
          'error'
        ).then(() => {
          this.router.navigate(['/productividad']);
        });
      }
    });
  }
}

