import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface ItemData {
  id?: number;
  titulo: string;
  contenido: string;
}

@Component({
  selector: 'app-form-edit-multiple-items',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './form-edit-multiple-items.html',
  styleUrl: './form-edit-multiple-items.css'
})
export class FormEditMultipleItems implements OnChanges {
  @Input() title: string = '';
  @Input() items: ItemData[] = [];
  @Input() isLoading: boolean = false;
  
  @Output() itemAdded = new EventEmitter<{ titulo: string; contenido: string }>();
  @Output() itemUpdated = new EventEmitter<{ id: number; titulo: string; contenido: string }>();
  @Output() itemDeleted = new EventEmitter<number>();
  @Output() cancelled = new EventEmitter<void>();

  itemForm!: FormGroup;
  editingItemId: number | null = null;
  showAddForm: boolean = false;

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      // Reset form when items change
      this.cancelEdit();
    }
  }

  private initializeForm(): void {
    this.itemForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      contenido: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  showAddItemForm(): void {
    this.showAddForm = true;
    this.cancelEdit();
    this.itemForm.reset();
  }

  cancelAdd(): void {
    this.showAddForm = false;
    this.itemForm.reset();
  }

  startEdit(item: ItemData): void {
    if (item.id) {
      this.editingItemId = item.id;
      this.showAddForm = false;
      this.itemForm.patchValue({
        titulo: item.titulo,
        contenido: item.contenido
      });
    }
  }

  cancelEdit(): void {
    this.editingItemId = null;
    this.itemForm.reset();
  }

  onSubmit(): void {
    if (this.itemForm.valid) {
      const formData = this.itemForm.value;
      
      if (this.editingItemId !== null) {
        // Update existing item
        this.itemUpdated.emit({
          id: this.editingItemId,
          titulo: formData.titulo,
          contenido: formData.contenido
        });
        this.cancelEdit();
      } else {
        // Add new item
        this.itemAdded.emit({
          titulo: formData.titulo,
          contenido: formData.contenido
        });
        this.cancelAdd();
      }
    } else {
      this.itemForm.markAllAsTouched();
    }
  }

  onDelete(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este elemento?')) {
      this.itemDeleted.emit(id);
    }
  }

  isEditing(id?: number): boolean {
    return this.editingItemId === id;
  }
}


