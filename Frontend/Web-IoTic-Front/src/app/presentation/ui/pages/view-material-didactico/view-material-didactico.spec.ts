import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMaterialDidactico } from './view-material-didactico';

describe('ViewMaterialDidactico', () => {
  let component: ViewMaterialDidactico;
  let fixture: ComponentFixture<ViewMaterialDidactico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewMaterialDidactico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewMaterialDidactico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
