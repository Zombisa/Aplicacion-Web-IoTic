import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { MaterialDidacticoDTO } from '../../../../models/DTO/informacion/MaterialDidacticoDTO';
import { MaterialDidacticoService } from '../../../../services/information/material-didactico.service';
import { LoadingService } from '../../../../services/loading.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-material-didactico',
  imports: [CommonModule, Header, LoadingPage],
  templateUrl: './view-material-didactico.html',
  styleUrl: './view-material-didactico.css'
})
export class ViewMaterialDidactico implements OnInit {
  private materialId!: number;
  public material!: MaterialDidacticoDTO;
  public materialImageUrl: string = 'assets/img/item-placeholder.svg';

  constructor(
    private materialService: MaterialDidacticoService,
    private activatedRoute: ActivatedRoute,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.materialId = Number(params.get('id'));
      console.log('ID del material obtenido de la URL:', this.materialId);
      this.getMaterialById();
    });
  }

  getMaterialById(): void {
    this.loadingService.show();
    console.log('Obteniendo el material con ID:', this.materialId);
    this.materialService.getById(this.materialId).subscribe({
      next: (material) => {
        this.material = material;
        console.log('Material obtenido:', this.material);
        const posibleImagen = this.material.image_r2;
        this.materialImageUrl =
          posibleImagen && posibleImagen.trim() !== ''
            ? posibleImagen
            : 'assets/img/item-placeholder.svg';
        
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener el material didáctico:', error);
        this.loadingService.hide();
        Swal.fire(
          'Error',
          'No se pudo cargar la información del material.',
          'error'
        ).then(() => {
          this.router.navigate(['/productividad']);
        });
      }
    });
  }
}
