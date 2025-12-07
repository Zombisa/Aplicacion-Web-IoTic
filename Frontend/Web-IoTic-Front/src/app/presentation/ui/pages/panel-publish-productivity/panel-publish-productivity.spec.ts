import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelPublishProductivity } from './panel-publish-productivity';

describe('PanelPublishProductivity', () => {
  let component: PanelPublishProductivity;
  let fixture: ComponentFixture<PanelPublishProductivity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelPublishProductivity]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelPublishProductivity);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
