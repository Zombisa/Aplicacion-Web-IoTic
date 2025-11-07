import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLoan } from './add-loan';

describe('AddLoan', () => {
  let component: AddLoan;
  let fixture: ComponentFixture<AddLoan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddLoan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddLoan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
