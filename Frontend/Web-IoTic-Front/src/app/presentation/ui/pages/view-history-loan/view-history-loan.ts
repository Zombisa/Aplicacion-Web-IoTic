import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Header } from '../../templates/header/header';
import { LoadingPage } from '../../components/loading-page/loading-page';
import { HistoryFilters, FilterType } from '../../components/history-filters/history-filters';
import { LoansHistoryList } from '../../templates/loans-history-list/loans-history-list';
import { LoadingService } from '../../../../services/loading.service';
import { LoanService } from '../../../../services/Loan.service';
import { LoanDTO } from '../../../../models/DTO/LoanDTO';
import { LoanHistoryDTO } from '../../../../models/DTO/LoanHistoryDTO';

@Component({
  selector: 'app-view-history-loan',
  imports: [CommonModule, Header, LoadingPage, HistoryFilters, LoansHistoryList],
  templateUrl: './view-history-loan.html',
  styleUrl: './view-history-loan.css'
})
export class ViewHistoryLoan implements OnInit {
  
  public displayedLoans: LoanHistoryDTO[] = [];
  public searchText: string = '';
  public activeFilter: FilterType = 'vigentes';

  constructor(
    public loadingService: LoadingService,
    private loanService: LoanService,
  ) {}

  ngOnInit(): void {
    this.loadLoansByFilter(this.activeFilter);
  }

  /** ==========================
   *  MANEJO DE BUSQUEDA
   * ========================== */
  onSearchChange(text: string): void {
    this.searchText = text;
  }

  /** ==========================
   *  CAMBIO DE FILTRO
   * ========================== */
  onFilterChange(filter: FilterType): void {
    this.activeFilter = filter;
    this.loadLoansByFilter(filter);
  }

  /** ==========================
   *  CARGA SEGÚN FILTRO
   * ========================== */
  private loadLoansByFilter(filter: FilterType): void {
    this.loadingService.show();

    let request$;

    switch (filter) {
      case 'vigentes':
        request$ = this.loanService.getLoansCurrent();
        break;

      case 'atrasados':
        request$ = this.loanService.getOverdueLoans();
        break;

      case 'devueltos':
        request$ = this.loanService.getLoansReturned();
        break;

      case 'todos':
        request$ = this.loanService.getLoans();
        break;

      default:
        return;
    }

    request$.subscribe({
      next: (loans: LoanDTO[]) => {
        this.displayedLoans = loans.map(l => this.convertToLoanHistoryDTO(l));
        this.loadingService.hide();
      },
      error: (err) => {
        console.error('Error loading loans:', err);
        this.loadingService.hide();
      }
    });
  }

  /** ==========================
   *  CONVERTIR DTO
   * ========================== */
  private convertToLoanHistoryDTO(loan: LoanDTO): LoanHistoryDTO {
    return {
      id: loan.id,
      nombre_persona: loan.nombre_persona,
      item: {
        id: loan.item,
        serial: loan.item_serial_snapshot,
        descripcion: loan.item_descripcion_snapshot,
        estado_fisico: loan.item_estado_fisico_snapshot,
        estado_admin: loan.item_estado_admin_snapshot,
        observacion: '',
        fecha_registro: ''
      },
      fecha_prestamo: loan.fecha_prestamo,
      fecha_devolucion: loan.fecha_devolucion,
      fecha_limite: loan.fecha_limite,
      estado: loan.estado,
      correo: loan.correo,
      telefono: loan.telefono,
      cedula: loan.cedula,
      direccion: loan.direccion
    };
  }

}
