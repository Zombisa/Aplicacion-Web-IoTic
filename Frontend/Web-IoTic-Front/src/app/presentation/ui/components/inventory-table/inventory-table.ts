import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
  @Input() inventoryData: ItemDTO[] = [];
  
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

  ngOnInit(): void {
    // Inicialización básica si es necesaria
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Se ejecuta cada vez que inventoryData cambia
    if (changes['inventoryData'] && this.inventoryData) {
      this.filteredData = [...this.inventoryData];
      this.extractFilterOptions();
    }
  }

  private extractFilterOptions(): void {
    if (!this.inventoryData || this.inventoryData.length === 0) return;
    this.estadosFisicos = [...new Set(this.inventoryData.map(item => item.estado_fisico))].filter(Boolean);
    this.estadosAdministrativos = [...new Set(this.inventoryData.map(item => item.estado_admin))].filter(Boolean);
  }

  applyFilters(): void {
    this.filteredData = this.inventoryData.filter(item => {
      // Filtro de búsqueda de texto - solo aplicar si hay texto
      const searchMatch = !this.filters.searchText || 
        item.descripcion.toLowerCase().includes(this.filters.searchText.toLowerCase()) ||
        item.serial.toString().includes(this.filters.searchText) ||
        item.observacion.toLowerCase().includes(this.filters.searchText.toLowerCase());
      
      
      const estadoFisicoMatch = !this.filters.estadoFisico || item.estado_fisico === this.filters.estadoFisico;
      const estadoAdminMatch = !this.filters.estadoAdministrativo || item.estado_admin === this.filters.estadoAdministrativo;
      
      return searchMatch  && estadoFisicoMatch && estadoAdminMatch;
    });
  }

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
}