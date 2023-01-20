import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CalculationImageComponent } from './calculation-image.component';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

describe('CalculationImageComponent', () => {
  let fixture: ComponentFixture<CalculationImageComponent>,
      component: CalculationImageComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CalculationImageComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(CalculationImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
