import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormItem } from './form-item';

describe('FormItem', () => {
  let component: FormItem;
  let fixture: ComponentFixture<FormItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
