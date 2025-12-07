import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionInfoItem } from './section-info-item';

describe('SectionInfoItem', () => {
  let component: SectionInfoItem;
  let fixture: ComponentFixture<SectionInfoItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionInfoItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionInfoItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
