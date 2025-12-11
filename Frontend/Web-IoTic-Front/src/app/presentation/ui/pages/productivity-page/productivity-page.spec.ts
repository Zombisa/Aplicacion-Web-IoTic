import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductivityPage } from './productivity-page';

describe('ProductivityPage', () => {
  let component: ProductivityPage;
  let fixture: ComponentFixture<ProductivityPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductivityPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductivityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
