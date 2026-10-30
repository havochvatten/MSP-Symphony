import { ComponentFixture, TestBed } from '@angular/core/testing';

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

  it('has an empty alt by default', () => {
    expect(fixture.nativeElement.querySelector('img').getAttribute('alt')).toBe('');
  });

  it('renders the given alt text', () => {
    fixture.componentRef.setInput('alt', 'Map of the cumulative environmental impact for "S1"');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img').getAttribute('alt'))
      .toBe('Map of the cumulative environmental impact for "S1"');
  });
});
