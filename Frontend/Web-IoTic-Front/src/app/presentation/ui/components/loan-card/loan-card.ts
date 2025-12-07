import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LoanHistoryDTO } from '../../../../models/DTO/LoanHistoryDTO';

@Component({
  selector: 'app-loan-card',
  imports: [CommonModule, RouterModule],
  templateUrl: './loan-card.html',
  styleUrl: './loan-card.css'
})
export class LoanCard {
  @Input() loan!: LoanHistoryDTO;
  @Output() viewLoan = new EventEmitter<number>();

  constructor(private router: Router) {}

  /**
   * Determinar el color de la barra lateral según el estado
   */
  getStatusColor(): string {
    if (this.isOverdue()) {
      return '#dc3545'; // Rojo para atrasado
    }
    return '#F3A537'; // Naranja para prestado (color-secondary)
  }

  /**
   * Verificar si el préstamo está atrasado
   */
  isOverdue(): boolean {
    if (!this.loan.fecha_limite || this.loan.fecha_devolucion) {
      return false;
    }
    const today = new Date();
    const limitDate = new Date(this.loan.fecha_limite);
    return limitDate < today;
  }

  /**
   * Obtener el estado del préstamo para mostrar
   */
  getStatusLabel(): string {
    if (this.isOverdue()) {
      return 'Atrasado';
    }
    if (this.loan.estado === 'Prestado' || this.loan.estado === 'prestado') {
      return 'Prestado';
    }
    return this.loan.estado;
  }

  /**
   * Formatear la fecha límite
   */
  formatDateLimit(): string {
    if (!this.loan.fecha_limite) {
      return 'No definida';
    }
    const date = new Date(this.loan.fecha_limite);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  }

  /**
   * Obtener el nombre completo del item
   */
  getItemName(): string {
    if (this.loan.item) {
      return `${this.loan.item.serial} ${this.loan.item.descripcion}`;
    }
    return 'Item no disponible';
  }

  /**
   * Navegar a la vista del item
   */
  onViewLoan(): void {
    if (this.loan.item?.id) {
      this.router.navigate(['/prestamos/pretamo', this.loan.id]);
    }
  }
}

