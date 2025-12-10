import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { SectionInfoProductivity } from '../../templates/section-info-productivity/section-info-productivity';
import { LoadingService } from '../../../../services/loading.service';
import { SoftwareService } from '../../../../services/information/software.service';
import { SoftwareDTO } from '../../../../models/DTO/informacion/SoftwareDTO';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-software',
  imports: [CommonModule, Header, LoadingPage, SectionInfoProductivity],
  templateUrl: './view-software.html',
  styleUrl: './view-software.css'
})
export class ViewSoftware implements OnInit {
  private softwareId!: number;
  public software!: SoftwareDTO;
  public softwareImageUrl: string = 'assets/img/item-placeholder.svg';

  constructor(
    private softwareService: SoftwareService,
    private activatedRoute: ActivatedRoute,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.softwareId = Number(params.get('id'));
      console.log('ID del software obtenido de la URL:', this.softwareId);
      this.getSoftwareById();
    });
  }

  getSoftwareById(): void {
    this.loadingService.show();
    console.log('Obteniendo el software con ID:', this.softwareId);
    this.softwareService.getById(this.softwareId).subscribe({
      next: (software) => {
        this.software = software;
        console.log('Software obtenido:', this.software);
        const posibleImagen = this.software.image_r2;
        this.softwareImageUrl =
          posibleImagen && posibleImagen.trim() !== ''
            ? posibleImagen
            : 'assets/img/item-placeholder.svg';
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener el software:', error);
        this.loadingService.hide();
        Swal.fire(
          'Error',
          'No se pudo cargar la información del software.',
          'error'
        ).then(() => {
          this.router.navigate(['/productividad']);
        });
      }
    });
  }
}

