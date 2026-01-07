import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistogramComponent } from './histogram.component';
import { DecimalPipe } from "@angular/common";
import { CalculationReportModule } from "@src/app/report/calculation-report.module";
import { Report } from "@data/calculation/calculation.interfaces";
import { NormalizationType } from "@data/calculation/calculation.service";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { provideZonelessChangeDetection } from "@angular/core";

describe('HistogramComponent', () => {
  let component: HistogramComponent;
  let fixture: ComponentFixture<HistogramComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CalculationReportModule,
        TranslateModule.forRoot()
      ],
      declarations: [ HistogramComponent ],
      providers: [
        DecimalPipe,
        TranslateService,
        provideZonelessChangeDetection()
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(HistogramComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.report = {
      average: 0,
      calculatedPixels: 0,
      chartData: { nodes: [], links: [] },
      chartWeightThreshold: 0.001,
      geographicalArea: 0,
      gridResolution: 0,
      histogram: new Array(100).fill(100),
      impactPerEcoComponent: { "0": 0 },
      impactPerPressure: { "0": 0 },
      areaMatrices: [],
      max: 100,
      min: 0,
      name: "",
      normalization: { type: NormalizationType.DOMAIN },
      operationName: "",
      operationOptions: {},
      scenarioChanges: { baseChanges: {}, areaChanges: {} },
      stddev: 0,
      timestamp: 0,
      total: 0,
      baselineName: ""
    };
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
