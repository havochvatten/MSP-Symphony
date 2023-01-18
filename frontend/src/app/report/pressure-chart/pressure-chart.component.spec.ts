import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DecimalPipe } from '@angular/common';

import { PressureChartComponent } from './pressure-chart.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

function setUp() {
  const fixture: ComponentFixture<PressureChartComponent> = TestBed.createComponent(
    PressureChartComponent
  );
  const component: PressureChartComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('PressureChartComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PressureChartComponent],
      imports: [TranslationSetupModule],
      providers: [DecimalPipe]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
