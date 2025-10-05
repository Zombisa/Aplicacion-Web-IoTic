import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button-primary',
  standalone: true,
  imports: [],
  templateUrl: './button-primary.html',
  styleUrls: ['./button-primary.css']
})
export class ButtonPrimary {
  @Output() clicked = new EventEmitter<void>();
  @Input() disabled: boolean = false;
  onClick() {
    this.clicked.emit();
  }
  
}
