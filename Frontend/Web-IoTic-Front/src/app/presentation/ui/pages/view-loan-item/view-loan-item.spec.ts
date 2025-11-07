import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLoanItem } from './view-loan-item';

describe('ViewLoanItem', () => {
  let component: ViewLoanItem;
  let fixture: ComponentFixture<ViewLoanItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewLoanItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewLoanItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
