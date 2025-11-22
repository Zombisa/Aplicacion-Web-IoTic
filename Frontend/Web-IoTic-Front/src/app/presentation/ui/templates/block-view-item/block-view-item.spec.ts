import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockViewItem } from './block-view-item';

describe('BlockViewItem', () => {
  let component: BlockViewItem;
  let fixture: ComponentFixture<BlockViewItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockViewItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockViewItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
