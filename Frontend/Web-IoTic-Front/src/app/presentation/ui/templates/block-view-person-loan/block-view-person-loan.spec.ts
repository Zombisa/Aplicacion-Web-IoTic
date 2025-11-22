import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockViewPersonLoan } from './block-view-person-loan';

describe('BlockViewPersonLoan', () => {
  let component: BlockViewPersonLoan;
  let fixture: ComponentFixture<BlockViewPersonLoan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockViewPersonLoan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockViewPersonLoan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
