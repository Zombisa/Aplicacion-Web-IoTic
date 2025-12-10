import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { ProductivityItemView } from '../../templates/productivity-item-view/productivity-item-view';
import { EventWorkService } from '../../../../services/information/event-work.service';
import { LoadingService } from '../../../../services/loading.service';
import { EventWorkDTO } from '../../../../models/DTO/EventWorkDTO';

@Component({
  selector: 'app-view-event-work-page',
  imports: [CommonModule, Header, LoadingPage, ProductivityItemView],
  templateUrl: './view-event-work-page.html',
  styleUrl: './view-event-work-page.css'
})
export class ViewEventWorkPage implements OnInit {
  private eventWorkId!: number;
  public eventWork?: EventWorkDTO;

  constructor(
    private eventWorkService: EventWorkService,
    private activatedRoute: ActivatedRoute,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.eventWorkId = Number(params.get('id'));
      console.log('ID del trabajo en evento obtenido de la URL:', this.eventWorkId);
      this.getEventWorkById();
    });
  }

  /**
   * Obtener el trabajo en evento por ID
   * @Returns void no retorna el trabajo pero si lo guarda dentro de la variable del componente
   */
  getEventWorkById(): void {
    this.loadingService.show();
    console.log('Obteniendo el trabajo en evento con ID:', this.eventWorkId);
    this.eventWorkService.getEventWorkById(this.eventWorkId).subscribe({
      next: (eventWork) => {
        this.eventWork = eventWork;
        console.log('Trabajo en evento obtenido:', this.eventWork);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener el trabajo en evento:', error);
        this.loadingService.hide();
      }
    });
  }
}

