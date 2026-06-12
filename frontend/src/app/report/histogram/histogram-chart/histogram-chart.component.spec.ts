import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistogramChartComponent } from './histogram-chart.component';
import { DecimalPipe } from "@angular/common";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { provideZonelessChangeDetection } from "@angular/core";

describe('HistogramChartComponent', () => {
  let component: HistogramChartComponent;
  let fixture: ComponentFixture<HistogramChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ TranslateModule.forRoot() ],
      declarations: [ HistogramChartComponent ],
      providers: [
        DecimalPipe,
        TranslateService,
        provideZonelessChangeDetection()
      ]
    })
      .compileComponents();
    fixture = TestBed.createComponent(HistogramChartComponent);
    component = fixture.componentInstance;
    component.bins = new Array(100).fill(100);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
