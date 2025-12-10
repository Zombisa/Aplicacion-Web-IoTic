import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BooksService } from '../../../../services/information/books.service';
import { CapBookService } from '../../../../services/information/cap-book.service';
import { ParticipacionComitesEvService } from '../../../../services/information/participacion-comites-ev.service';
import { ProcesoTecnicaService } from '../../../../services/information/proceso-tecnica.service';
import { RevistaService } from '../../../../services/information/revista.service';
import { SoftwareService } from '../../../../services/information/software.service';
import { TrabajoEventosService } from '../../../../services/information/trabajo-eventos.service';
import { TutoriaConcluidaService } from '../../../../services/information/tutoria-concluida.service';
import { TutoriaEnMarchaService } from '../../../../services/information/tutoria-en-marcha.service';
import { LoadingService } from '../../../../services/loading.service';
import { BaseProductivityDTO } from '../../../../models/Common/BaseProductivityDTO';
import { CommonEngine } from '@angular/ssr/node';
import { CommonModule } from '@angular/common';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';

@Component({
  selector: 'app-productivity-list-type-page',
  templateUrl: './productivity-list-type-page.html',
  imports: [CommonModule, Header, LoadingPage],
  styleUrl: './productivity-list-type-page.css'
})
export class ProductivityListTypePage {

  tipo: string = '';
  listTypes: BaseProductivityDTO[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    public loadingService: LoadingService,
    private booksService: BooksService,
    private capBookService: CapBookService,
    private participacionComitesEvService: ParticipacionComitesEvService,
    private tutoriaEnMarchaService: TutoriaEnMarchaService,
    private tutoriaConcluidaService: TutoriaConcluidaService,
    private trabajoEventosService: TrabajoEventosService,
    private softwareService: SoftwareService,
    private revistaService: RevistaService,
    private procesoTecnicaService: ProcesoTecnicaService,
  ) {}
  /**
   * Inicializa el componente y obtiene el tipo de productividad desde la ruta
   */
  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const tipoParam = params.get('tipo');
      if (!tipoParam) return;

      this.tipo = tipoParam;
      this.listarSegunTipo();
    });
  }
  /**
   * Lista los ítems según el tipo de productividad seleccionado
   * llama al servicio correspondiente para obtener la lista
   * 
   */
  private listarSegunTipo() {
    const acciones: Record<string, () => void> = {
      libro: () => this.getList(this.booksService.getBooks()),
      capitulo_libro: () => this.getList(this.capBookService.getCapBooks()),
      participacion_comites: () => this.getList(this.participacionComitesEvService.getAll()),
      tutoria_en_marcha: () => this.getList(this.tutoriaEnMarchaService.getAll()),
      tutoria_concluida: () => this.getList(this.tutoriaConcluidaService.getAll()),
      trabajo_eventos: () => this.getList(this.trabajoEventosService.getAll()),
      software: () => this.getList(this.softwareService.getAll()),
      revista: () => this.getList(this.revistaService.getAll()),
      proceso_tecnica: () => this.getList(this.procesoTecnicaService.getAll()),
    };

    if (acciones[this.tipo]) {
      acciones[this.tipo]();
    } else {
      console.warn(`Tipo desconocido: ${this.tipo}`);
    }
  }
  /**
   * Guarda lo traido por el observable en la lista de ítems
   * @param observable Observable que trae la lista de ítems según el tipo
   */
  private getList(observable: any) {
    this.loadingService.show();
    observable.subscribe({
      next: (resp: BaseProductivityDTO[]) => {
        this.listTypes = resp;
        console.log('Información del tipo:', this.tipo, resp);
        this.loadingService.hide();
      },
      error: () => {
        console.error('Error al cargar información del tipo:', this.tipo);
        this.loadingService.hide();
      }
    });
  }
}
