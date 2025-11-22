import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPersonLoan } from './form-person-loan';

describe('FormPersonLoan', () => {
  let component: FormPersonLoan;
  let fixture: ComponentFixture<FormPersonLoan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormPersonLoan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormPersonLoan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
