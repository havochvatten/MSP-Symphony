import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreModule } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { provideHttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { TranslateSpecModule } from '@src/testing/translate-spec.module';
import { OrdinalPipe } from '@shared/ordinal.pipe';
import { NormalizationType } from '@data/calculation/calculation.service';
import { ScenarioAreaDetailComponent } from './scenario-area-detail.component';
import { IconComponent } from '@shared/icon/icon.component';
import { ChangesListComponent } from '@src/app/map-view/scenario/scenario-detail/changes-list/changes-list.component';
import { MatrixSelectionComponent } from '@src/app/map-view/scenario/scenario-area-detail/matrix-selection/matrix-selection.component';
import { initialState as calculation } from '@data/calculation/calculation.reducers';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { initialState as scenario } from '@data/scenario/scenario.reducers';
import { initialState as user } from '@data/user/user.reducers';
import { provideZonelessChangeDetection } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { registerLocaleData } from '@angular/common';
import localeSv from '@angular/common/locales/sv';

registerLocaleData(localeSv);

describe('ScenarioAreaDetailComponent', () => {
  let component: ScenarioAreaDetailComponent;
  let fixture: ComponentFixture<ScenarioAreaDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}, {}), TranslateSpecModule, MatRadioModule, MatSelectModule],
      declarations: [
        ScenarioAreaDetailComponent,
        OrdinalPipe,
        IconComponent,
        ChangesListComponent,
        MatrixSelectionComponent
      ],
      providers: [
        OrdinalPipe,
        TranslateService,
        provideHttpClient(),
        provideMockStore({
          initialState: {
            calculation,
            metadata,
            scenario,
            user
          }
        }),
        provideZonelessChangeDetection()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ScenarioAreaDetailComponent);
    component = fixture.componentInstance;
    component.scenario = {
      operation: 0,
      operationOptions: {},
      id: -1,
      timestamp: 0,
      baselineId: 0,
      changes: {},
      ecosystemsToInclude: [],
      name: '',
      normalization: { type: NormalizationType.DOMAIN },
      pressuresToInclude: [],
      areas: [
        {
          id: 1,
          feature: {
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates: [] },
            properties: { feature: { name: '' } }
          },
          changes: {},
          matrix: { matrixType: 'STANDARD' },
          scenarioId: -1,
          excludedCoastal: null,
          customCalcAreaId: null
        }
      ],
      latestCalculationId: null
    };
    component.areaIndex = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('formats with the new locale after a language switch', async () => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('sv', { map: { editor: { normalization: { custom: 'Eget' } } } });
    translate.setTranslation('en', { map: { editor: { normalization: { custom: 'Custom' } } } });
    await translate.use('sv');

    const switchedFixture = TestBed.createComponent(ScenarioAreaDetailComponent);
    const switched = switchedFixture.componentInstance;
    switched.scenario = {
      ...component.scenario,
      normalization: { type: NormalizationType.USER_DEFINED, userDefinedValue: 0.5 }
    };
    switched.areaIndex = 0;
    await switchedFixture.whenStable();
    const normalizationText = () =>
      switchedFixture.nativeElement
        .querySelector('#applied-group-settings > div:nth-child(2) span')
        .textContent.replace(/\s+/g, ' ')
        .trim();
    expect(switched['locale']()).toBe('sv');
    expect(normalizationText()).toBe('Eget = 0,5');

    await translate.use('en');
    await switchedFixture.whenStable();

    expect(switched['locale']()).toBe('en');
    expect(normalizationText()).toBe('Custom = 0.5');
  });
});
