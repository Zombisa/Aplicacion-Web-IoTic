import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { GalleryRegistroFotografico } from '../../templates/gallery-registro-fotografico/gallery-registro-fotografico';

import { RegistroFotograficoDTO } from '../../../../models/DTO/RegistroFotograficoDTO';

import Swal from 'sweetalert2';
import { RegistroFotograficoService } from '../../../../services/registro-fotografico.service';
import { LoadingService } from '../../../../services/loading.service';

@Component({
  selector: 'app-registro-fotografico-admin-page',
  standalone: true,
  imports: [
    CommonModule,
    Header,
    LoadingPage,
    GalleryRegistroFotografico
  ],
  templateUrl: './registro-fotografico-admin-page.html',
  styleUrls: ['./registro-fotografico-admin-page.css']
})
export class RegistroFotograficoAdminPage implements OnInit {

  registros: RegistroFotograficoDTO[] = [];

  constructor(
    private registroService: RegistroFotograficoService,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarRegistros();
  }

  private cargarRegistros(): void {
    this.loadingService.show?.();
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

  /** Navegar a crear nuevo registro */
  nuevoRegistro(): void {
    this.router.navigate(['/admin/registro-fotografico/nuevo']);
  }

  /** Desde la galería: editar */
  onEdit(registro: RegistroFotograficoDTO): void {
    this.router.navigate(['/admin/registro-fotografico/editar', registro.id]);
  }

  /** Desde la galería: eliminar con confirmación */
  onRemove(registro: RegistroFotograficoDTO): void {
    Swal.fire({
      title: 'Eliminar registro',
      text: `¿Seguro que deseas eliminar "${registro.titulo || 'este registro'}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    }).then(result => {
      if (result.isConfirmed) {
        this.eliminarRegistro(registro.id);
      }
    });
  }

  private eliminarRegistro(id: number): void {
    this.loadingService.show?.();
    this.registroService.delete(id).subscribe({
      next: () => {
        this.cargarRegistros();
        this.loadingService.hide?.();
        Swal.fire({
          icon: 'success',
          title: 'Registro eliminado',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: err => {
        console.error(err);
        this.loadingService.hide?.();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el registro.'
        });
      }
    });
  }
}
