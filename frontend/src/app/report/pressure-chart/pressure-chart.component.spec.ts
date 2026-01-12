import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DecimalPipe } from '@angular/common';

import { PressureChartComponent } from './pressure-chart.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { StoreModule } from "@ngrx/store";
import { provideMockStore } from "@ngrx/store/testing";
import { provideZonelessChangeDetection } from "@angular/core";

describe('PressureChartComponent', () => {
  let fixture: ComponentFixture<PressureChartComponent>,
      component: PressureChartComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PressureChartComponent],
      imports: [StoreModule.forRoot({}, {}), TranslationSetupModule],
      providers: [
        DecimalPipe,
        provideMockStore({
          initialState : { user: {} }
        }),
        provideZonelessChangeDetection(),
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(PressureChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
