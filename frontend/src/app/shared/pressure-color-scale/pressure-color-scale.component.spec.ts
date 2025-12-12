import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PressureColorScaleComponent } from './pressure-color-scale.component';
import { provideZonelessChangeDetection } from "@angular/core";

describe('PressureColorScaleComponent', () => {
  let fixture: ComponentFixture<PressureColorScaleComponent>,
      component: PressureColorScaleComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection()
      ],
      declarations: [ PressureColorScaleComponent ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(PressureColorScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
