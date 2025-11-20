import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ItemDTO } from '../../../../models/DTO/ItemDTO';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventory-table',
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-table.html',
  styleUrl: './inventory-table.css'
})
export class InventoryTable implements OnInit, OnChanges {
  /** Datos de inventario recibidos como entrada */
  @Input() inventoryData: ItemDTO[] = [];
  @Output() itemSelected = new EventEmitter<number>();

  filteredData: ItemDTO[] = [];
  filters = {
    searchText: '',
    estadoFisico: '',
    estadoAdministrativo: ''
  };
  
  locations: string[] = [];
  estados: string[] = [];
  estadosFisicos: string[] = [];
  estadosAdministrativos: string[] = [];
  currentPage = 1;
  pageSize = 10; // cantidad de filas por página

  ngOnInit(): void {
    // Inicialización básica si es necesaria
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['inventoryData'] && this.inventoryData) {
      this.filteredData = [...this.inventoryData];
      this.extractFilterOptions();
    }
  }
  /**
   * EXTRAER opciones únicas para los filtros desde los datos de inventario
   */
  private extractFilterOptions(): void {
    if (!this.inventoryData || this.inventoryData.length === 0) return;
    this.estadosFisicos = [...new Set(this.inventoryData.map(item => item.estado_fisico))].filter(Boolean);
    this.estadosAdministrativos = [...new Set(this.inventoryData.map(item => item.estado_admin))].filter(Boolean);
  }
  /**
   * APLICAR filtros a los datos de inventario
   */
  applyFilters(): void {
    this.filteredData = this.inventoryData.filter(item => {
      // Filtro de búsqueda de texto - solo aplicar si hay texto
      const searchMatch = !this.filters.searchText || 
        item.descripcion.toLowerCase().includes(this.filters.searchText.toLowerCase()) ||
        item.serial.toString().includes(this.filters.searchText) ||
        item.observacion.toLowerCase().includes(this.filters.searchText.toLowerCase());
      
      
      const estadoFisicoMatch = !this.filters.estadoFisico || item.estado_fisico === this.filters.estadoFisico;
      const estadoAdminMatch = !this.filters.estadoAdministrativo || item.estado_admin === this.filters.estadoAdministrativo;
      this.currentPage = 1;
      return searchMatch  && estadoFisicoMatch && estadoAdminMatch;
    });
  }
  /**
   * LIMPIAR todos los filtros y restaurar los datos originales
   */
  clearFilters(): void {
    this.filters = {
      searchText: '',
      estadoFisico: '',
      estadoAdministrativo: ''
    };
    this.filteredData = [...this.inventoryData];
  }
  
  getResultsCount(): number {
    return this.filteredData.length;
  }

  /**
   * 
   * @returns Número total de páginas basado en los datos filtrados y el tamaño de página
   */
  totalPages() {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }
  /**
   * 
   * @returns retorna la pagina actual
   */
  paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredData.slice(start, end);
  }
  /*
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
   * Emitir el item seleccionado al componente padre
   */
  selectItem(item: ItemDTO) {
    this.itemSelected.emit(item.id);
  }
}