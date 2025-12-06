import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanCard } from '../../components/loan-card/loan-card';
import { LoanHistoryDTO } from '../../../../models/DTO/LoanHistoryDTO';

@Component({
  selector: 'app-loans-history-list',
  imports: [CommonModule, LoanCard],
  templateUrl: './loans-history-list.html',
  styleUrl: './loans-history-list.css'
})
export class LoansHistoryList implements OnChanges {
  @Input() loans: LoanHistoryDTO[] = [];
  @Input() searchText: string = '';

  filteredLoans: LoanHistoryDTO[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loans'] || changes['searchText']) {
      this.applyFilters();
    }
  }

  /**
   * Aplicar filtro de búsqueda
   * Busca solo por descripción del item y nombre de la persona
   */
  private applyFilters(): void {
    if (!this.searchText || this.searchText.trim() === '') {
      this.filteredLoans = [...this.loans];
      return;
    }

    const searchLower = this.searchText.toLowerCase().trim();
    this.filteredLoans = this.loans.filter(loan => {
      // Buscar por descripción del item
      const itemDescription = loan.item?.descripcion?.toLowerCase() || '';
      // Buscar por nombre de la persona
      const personName = loan.nombre_persona?.toLowerCase() || '';

      return itemDescription.includes(searchLower) ||
             personName.includes(searchLower);
    });
  }

  /**
   * Verificar si hay préstamos para mostrar
   */
  hasLoans(): boolean {
    return this.filteredLoans.length > 0;
  }
}


