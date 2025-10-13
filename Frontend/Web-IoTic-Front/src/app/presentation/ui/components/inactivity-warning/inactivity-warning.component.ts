import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inactivity-warning',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inactivity-warning.component.html',
  styleUrls: ['./inactivity-warning.component.css']
})
export class InactivityWarningComponent implements OnInit, OnDestroy {
  showWarning = false;
  timeLeft = 0;
  private warningSubscription?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.warningSubscription = this.authService.warningStatus$.subscribe(
      ({ show, timeLeft }) => {
        this.showWarning = show;
        this.timeLeft = timeLeft;
      }
    );
  }

  ngOnDestroy() {
    if (this.warningSubscription) {
      this.warningSubscription.unsubscribe();
    }
  }

  extendSession() {
    this.authService.extendSession();
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
