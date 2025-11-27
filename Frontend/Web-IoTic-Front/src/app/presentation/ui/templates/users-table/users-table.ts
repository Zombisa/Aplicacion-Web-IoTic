import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { UserDTO } from '../../../../models/DTO/UserDTO';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-users-table',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './users-table.html',
  styleUrl: './users-table.css'
})
export class UsersTable implements OnInit, OnChanges {
  @Input() usersData: UserDTO[] = [];
  @Output() userSelected = new EventEmitter<UserDTO>();
  @Output() editUser = new EventEmitter<UserDTO>();
  @Output() toggleStatus = new EventEmitter<UserDTO>();
  @Output() deleteUser = new EventEmitter<UserDTO>();

  filteredData: UserDTO[] = [];
  selectedUser: UserDTO | null = null;
  filters = {
    searchText: '',
    rol: ''
  };
  
  roles: string[] = [];
  currentPage = 1;
  pageSize = 10;

  ngOnInit(): void {
    // Inicialización básica si es necesaria
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usersData'] && this.usersData) {
      this.filteredData = [...this.usersData];
      this.extractFilterOptions();
    }
  }

  /**
   * Extraer opciones únicas para los filtros desde los datos de usuarios
   */
  private extractFilterOptions(): void {
    if (!this.usersData || this.usersData.length === 0) return;
    this.roles = [...new Set(this.usersData.map(user => user.rol))].filter(Boolean);
  }

  /**
   * Aplicar filtros a los datos de usuarios
   */
  applyFilters(): void {
    this.filteredData = this.usersData.filter(user => {
      const searchMatch = !this.filters.searchText || 
        user.nombre.toLowerCase().includes(this.filters.searchText.toLowerCase()) ||
        user.apellido.toLowerCase().includes(this.filters.searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(this.filters.searchText.toLowerCase());
      
      const rolMatch = !this.filters.rol || user.rol === this.filters.rol;
      this.currentPage = 1;
      return searchMatch && rolMatch;
    });
  }

  /**
   * Limpiar todos los filtros y restaurar los datos originales
   */
  clearFilters(): void {
    this.filters = {
      searchText: '',
      rol: ''
    };
    this.filteredData = [...this.usersData];
  }
  
  getResultsCount(): number {
    return this.filteredData.length;
  }

  /**
   * @returns Número total de páginas basado en los datos filtrados y el tamaño de página
   */
  totalPages() {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  /**
   * @returns retorna la pagina actual
   */
  paginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredData.slice(start, end);
  }

  /**
   * Navegar a la página siguiente
   */
  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
  }

  /**
   * Navegar a la página anterior
   */
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  /**
   * Seleccionar un usuario y emitir el evento al componente padre
   */
  selectUser(user: UserDTO) {
    this.selectedUser = user;
    this.userSelected.emit(user);
  }

  /**
   * Verificar si un usuario está seleccionado
   */
  isSelected(user: UserDTO): boolean {
    return this.selectedUser?.id === user.id;
  }

  /**
   * Emitir evento para editar usuario
   */
  onEdit(user: UserDTO): void {
    this.editUser.emit(user);
  }

  /**
   * Emitir evento para cambiar estado del usuario
   */
  onToggleStatus(user: UserDTO): void {
    this.toggleStatus.emit(user);
  }

  /**
   * Emitir evento para eliminar usuario
   */
  onDelete(user: UserDTO): void {
    this.deleteUser.emit(user);
  }
}

