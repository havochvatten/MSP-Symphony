import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DecimalPipe } from '@angular/common';

import { PressureChartComponent } from './pressure-chart.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

describe('PressureChartComponent', () => {
  let fixture: ComponentFixture<PressureChartComponent>,
      component: PressureChartComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PressureChartComponent],
      imports: [TranslationSetupModule],
      providers: [DecimalPipe]
    }).compileComponents();
    fixture = TestBed.createComponent(PressureChartComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
