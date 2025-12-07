import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCapBook } from './form-cap-book';

describe('FormCapBook', () => {
  let component: FormCapBook;
  let fixture: ComponentFixture<FormCapBook>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCapBook]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCapBook);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
