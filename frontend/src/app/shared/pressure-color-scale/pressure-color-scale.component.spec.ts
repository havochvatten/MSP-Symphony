import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PressureColorScaleComponent } from './pressure-color-scale.component';

describe('PressureColorScaleComponent', () => {
  let fixture: ComponentFixture<PressureColorScaleComponent>,
      component: PressureColorScaleComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PressureColorScaleComponent ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(PressureColorScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
