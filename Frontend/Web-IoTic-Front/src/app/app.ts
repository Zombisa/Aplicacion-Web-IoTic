import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InactivityWarningComponent } from './presentation/ui/components/inactivity-warning/inactivity-warning.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, InactivityWarningComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Web-IoTic-Front');
}
