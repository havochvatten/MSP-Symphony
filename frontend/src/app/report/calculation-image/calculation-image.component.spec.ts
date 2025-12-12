import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CalculationImageComponent } from './calculation-image.component';
import { provideZonelessChangeDetection } from "@angular/core";

describe('CalculationImageComponent', () => {
  let fixture: ComponentFixture<CalculationImageComponent>,
      component: CalculationImageComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection()
      ],
      declarations: [CalculationImageComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(CalculationImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
