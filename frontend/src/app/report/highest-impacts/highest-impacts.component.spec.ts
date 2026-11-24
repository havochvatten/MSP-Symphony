import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighestImpactsComponent } from './highest-impacts.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { colorForValue } from '@shared/legend-color';

describe('HighestImpactsComponent', () => {
  let fixture: ComponentFixture<HighestImpactsComponent>, component: HighestImpactsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      declarations: [HighestImpactsComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(HighestImpactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('colours each bar as the result map would colour its share', () => {
    const legend = [
      { color: '#000000', quantity: 1 },
      { color: '#ffffff', quantity: 100 }
    ];
    component.legend = legend;
    for (const share of [0.5, 1, 42, 100]) {
      expect(component.getColor(share)).toBe(colorForValue(legend, share));
    }
  });

  it('draws no bar colour until the legend has loaded', () => {
    component.legend = undefined;
    expect(component.getColor(42)).toBe('transparent');
  });
});
