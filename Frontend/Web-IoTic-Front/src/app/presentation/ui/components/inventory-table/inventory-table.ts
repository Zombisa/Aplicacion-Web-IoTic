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
    estado: '',
    ubicacion: '',
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
    this.locations = [...new Set(this.inventoryData.map(item => item.ubicacion))].filter(Boolean);
    this.estados = [...new Set(this.inventoryData.map(item => item.estadoAdministrativo))].filter(Boolean);
    this.estadosFisicos = [...new Set(this.inventoryData.map(item => item.estadoFisico))].filter(Boolean);
    this.estadosAdministrativos = [...new Set(this.inventoryData.map(item => item.estadoAdministrativo))].filter(Boolean);
  }

  applyFilters(): void {
    this.filteredData = this.inventoryData.filter(item => {
      // Filtro de búsqueda de texto - solo aplicar si hay texto
      const searchMatch = !this.filters.searchText || 
        item.descripcionArticulo.toLowerCase().includes(this.filters.searchText.toLowerCase()) ||
        item.numeroSerieActivo.toString().includes(this.filters.searchText) ||
        item.observacion.toLowerCase().includes(this.filters.searchText.toLowerCase());
      
      const ubicacionMatch = !this.filters.ubicacion || item.ubicacion === this.filters.ubicacion;
      const estadoFisicoMatch = !this.filters.estadoFisico || item.estadoFisico === this.filters.estadoFisico;
      const estadoAdminMatch = !this.filters.estadoAdministrativo || item.estadoAdministrativo === this.filters.estadoAdministrativo;
      
      return searchMatch && ubicacionMatch && estadoFisicoMatch && estadoAdminMatch;
    });
  }

  clearFilters(): void {
    this.filters = {
      searchText: '',
      estado: '',
      ubicacion: '',
      estadoFisico: '',
      estadoAdministrativo: ''
    };
    this.filteredData = [...this.inventoryData];
  }

  getResultsCount(): number {
    return this.filteredData.length;
  }
}