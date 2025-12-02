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
  public allLoans: LoanDTO[] = [];
  public currentLoans: LoanDTO[] = [];
  public displayedLoans: LoanHistoryDTO[] = [];
  
  public searchText: string = '';
  public activeFilter: FilterType = 'vigentes';

  constructor(
    public loadingService: LoadingService,
    private loanService: LoanService,
  ) {}

  ngOnInit(): void {
    this.loadLoans();
  }

  /**
   * Cargar todos los préstamos
   */
  private loadLoans(): void {
    this.loadingService.show();
    this.loanService.getLoans().subscribe({
      next: (loans) => {
        this.allLoans = loans;
        this.applyFilters();
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener los préstamos:', error);
        this.loadingService.hide();
      }
    });
  }

  /**
   * Manejar cambio en el texto de búsqueda
   */
  onSearchChange(searchText: string): void {
    this.searchText = searchText;
    // La búsqueda se aplica en el template loans-history-list
    // Solo necesitamos actualizar el texto para que el componente hijo lo reciba
  }

  /**
   * Manejar cambio en el filtro activo
   */
  onFilterChange(filter: FilterType): void {
    this.activeFilter = filter;
    // Si cambia a "atrasados", cargar desde el backend
    // Si cambia a otros, aplicar filtros sobre los datos ya cargados
    this.applyFilters();
  }

  /**
   * Aplicar filtros según el tipo seleccionado
   */
  private applyFilters(): void {
    // Si el filtro es "atrasados", usar el endpoint específico del backend
    if (this.activeFilter === 'atrasados') {
      this.loadOverdueLoans();
      return;
    }

    // Para otros filtros, usar los datos ya cargados
    let filtered: LoanDTO[] = [];

    switch (this.activeFilter) {
      case 'vigentes':
        // Préstamos activos (prestados y no devueltos)
        filtered = this.allLoans.filter(loan => 
          (loan.estado === 'Prestado' || loan.estado === 'prestado') && !loan.fecha_devolucion
        );
        break;
      case 'todos':
        filtered = [...this.allLoans];
        break;
    }

    // Convertir LoanDTO a LoanHistoryDTO y aplicar búsqueda
    this.displayedLoans = filtered.map(loan => this.convertToLoanHistoryDTO(loan));
  }

  /**
   * Cargar préstamos vencidos desde el backend
   */
  private loadOverdueLoans(): void {
    this.loadingService.show();
    this.loanService.getOverdueLoans().subscribe({
      next: (loans) => {
        this.displayedLoans = loans.map(loan => this.convertToLoanHistoryDTO(loan));
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error al obtener préstamos vencidos:', error);
        this.loadingService.hide();
        // En caso de error, filtrar localmente
        const today = new Date();
        const filtered = this.allLoans.filter(loan => {
          if (!loan.fecha_limite || loan.fecha_devolucion) return false;
          const limitDate = new Date(loan.fecha_limite);
          return limitDate < today && (loan.estado === 'Prestado' || loan.estado === 'prestado');
        });
        this.displayedLoans = filtered.map(loan => this.convertToLoanHistoryDTO(loan));
      }
    });
  }

  /**
   * Convertir LoanDTO a LoanHistoryDTO
   */
  private convertToLoanHistoryDTO(loan: LoanDTO): LoanHistoryDTO {
    return {
      id: loan.id,
      nombre_persona: loan.nombre_persona,
      item: loan.item,
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
