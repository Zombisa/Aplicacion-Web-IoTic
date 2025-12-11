import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewHistoryLoan } from './view-history-loan';

describe('ViewHistoryLoan', () => {
  let component: ViewHistoryLoan;
  let fixture: ComponentFixture<ViewHistoryLoan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewHistoryLoan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewHistoryLoan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
