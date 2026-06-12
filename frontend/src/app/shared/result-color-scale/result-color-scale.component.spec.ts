import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultColorScaleComponent } from './result-color-scale.component';
import { provideZonelessChangeDetection } from "@angular/core";

describe('ResultColorScaleComponent', () => {
  let fixture: ComponentFixture<ResultColorScaleComponent>,
      component: ResultColorScaleComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      declarations: [ ResultColorScaleComponent ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ResultColorScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
