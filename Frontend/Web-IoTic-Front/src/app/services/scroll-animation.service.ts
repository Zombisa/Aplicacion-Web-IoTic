import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollAnimationServices {
 private observer?: IntersectionObserver;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser && typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(this.handleIntersect.bind(this), {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px',
      });
    }
  }

  observeElements(container: HTMLElement): void {
    if (!this.isBrowser || !this.observer) return;
    const elements = container.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => this.observer!.observe(el));
  }

  disconnect(): void {
    this.observer?.disconnect();
  }

  private handleIntersect(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target as HTMLElement;
        el.classList.add('is-visible');
        this.observer?.unobserve(el);
      }
    });
  }
}
