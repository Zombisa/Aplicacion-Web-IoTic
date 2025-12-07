import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionInfoLoan } from './section-info-loan';

describe('SectionInfoLoan', () => {
  let component: SectionInfoLoan;
  let fixture: ComponentFixture<SectionInfoLoan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionInfoLoan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionInfoLoan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
