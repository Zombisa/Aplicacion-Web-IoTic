import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export type FilterType = 'vigentes' | 'todos' | 'atrasados' | 'devueltos';

@Component({
  selector: 'app-history-filters',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './history-filters.html',
  styleUrl: './history-filters.css'
})
export class HistoryFilters {
  @Input() searchText: string = '';
  @Input() activeFilter: FilterType = 'vigentes';

  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<FilterType>();

  onSearchChange(value: string): void {
    this.searchChange.emit(value);
  }

  onFilterClick(filter: FilterType): void {
    this.activeFilter = filter;
    this.filterChange.emit(filter);
  }
}


