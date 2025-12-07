import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LoanDTOConsultById } from '../../../../models/DTO/LoanDTOConsultById';

@Component({
  selector: 'app-section-info-loan',
  imports: [CommonModule],
  templateUrl: './section-info-loan.html',
  styleUrl: './section-info-loan.css'
})
export class SectionInfoLoan {
  @Input() loanData!: LoanDTOConsultById;

  /**
   * Formatear fecha para mostrar en formato legible
   */
  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }
}
