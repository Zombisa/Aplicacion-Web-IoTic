import { TestBed } from '@angular/core/testing';

import { ScrollAnimationServices } from './scroll-animation.services';

describe('ScrollAnimationServices', () => {
  let service: ScrollAnimationServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScrollAnimationServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
