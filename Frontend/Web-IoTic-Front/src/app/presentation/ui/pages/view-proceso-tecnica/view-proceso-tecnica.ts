import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { LoadingService } from '../../../../services/loading.service';
import { ProcesoTecnicaService } from '../../../../services/information/proceso-tecnica.service';
import { ProcesoTecnicaDTO } from '../../../../models/DTO/informacion/ProcesoTecnicaDTO';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-proceso-tecnica',
  imports: [CommonModule, Header, LoadingPage],
  templateUrl: './view-proceso-tecnica.html',
  styleUrl: './view-proceso-tecnica.css'
})
export class ViewProcesoTecnica implements OnInit {
  private procesoId!: number;
  public proceso!: ProcesoTecnicaDTO;
  public procesoImageUrl: string = 'assets/img/item-placeholder.svg';

  constructor(
    private procesoService: ProcesoTecnicaService,
    private activatedRoute: ActivatedRoute,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.procesoId = Number(params.get('id'));
      this.getProcesoById();
    });
  }

  getProcesoById(): void {
    this.loadingService.show();
    this.procesoService.getById(this.procesoId).subscribe({
      next: (proceso) => {
        this.proceso = proceso;
        const posibleImagen = proceso.image_r2;
        this.procesoImageUrl =
          posibleImagen && posibleImagen.trim() !== ''
            ? posibleImagen
            : 'assets/img/item-placeholder.svg';
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener el proceso/técnica:', error);
        this.loadingService.hide();
        Swal.fire(
          'Error',
          'No se pudo cargar la información del proceso o técnica.',
          'error'
        ).then(() => {
          this.router.navigate(['/productividad']);
        });
      }
    });
  }
}


