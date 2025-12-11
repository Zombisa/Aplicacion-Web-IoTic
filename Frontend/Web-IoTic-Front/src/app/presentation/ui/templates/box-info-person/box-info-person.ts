import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-box-info-person',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './box-info-person.html',
  styleUrl: './box-info-person.css'
})
export class BoxInfoPerson {
  @Output() nameChange = new EventEmitter<string>();
  @Input() nameInput: string = '';
  @Input() edit: boolean = false;

  constructor() {
  }

  onNameChange(event: any) {
    const newName = event.target.value;
    this.nameChange.emit(newName);
  }
}
