import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UncertaintyLegendComponent } from './uncertainty-legend.component';

describe('UncertaintyLegendComponent', () => {
  let component: UncertaintyLegendComponent;
  let fixture: ComponentFixture<UncertaintyLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UncertaintyLegendComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UncertaintyLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
