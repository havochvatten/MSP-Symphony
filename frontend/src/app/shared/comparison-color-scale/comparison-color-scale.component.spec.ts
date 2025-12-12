import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparisonColorScaleComponent } from './comparison-color-scale.component';
import { provideZonelessChangeDetection } from "@angular/core";

describe('ComparisonColorScaleComponent', () => {
  let component: ComparisonColorScaleComponent;
  let fixture: ComponentFixture<ComparisonColorScaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection()
      ],
      declarations: [ ComparisonColorScaleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparisonColorScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
