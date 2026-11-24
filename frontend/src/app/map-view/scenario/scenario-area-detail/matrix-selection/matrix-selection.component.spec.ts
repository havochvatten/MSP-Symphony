import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SharedModule } from '@shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { initialState as area } from '@data/area/area.reducers';
import { initialState as scenario } from '@data/scenario/scenario.reducers';
import { MatrixSelectionComponent } from './matrix-selection.component';
import { MatRadioButton, MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { NormalizationType } from '@data/calculation/calculation.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslateSpecModule } from '@src/testing/translate-spec.module';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Scenario } from '@data/scenario/scenario.interfaces';
import { ChangeLanguageDialogComponent } from '@shared/change-language-dialog/change-language-dialog.component';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { ChangeBaselineDialogComponent } from '@shared/change-baseline-dialog/change-baseline-dialog.component';
import { provideMockActions } from '@ngrx/effects/testing';
import { EMPTY } from 'rxjs';
import { Baseline } from '@data/user/user.interfaces';
import { initialState as user } from '@data/user/user.reducers';
import { ScenarioSelectors } from '@data/scenario';
import { AreaMatrixData, MatrixRef } from './matrix.interfaces';

const testScenario: Scenario = {
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

describe('MatrixSelectionComponent', () => {
  let component: MatrixSelectionComponent;
  let fixture: ComponentFixture<MatrixSelectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslationSetupModule,
        MatRadioModule,
        MatSelectModule,
        TranslateSpecModule
      ],
      declarations: [MatrixSelectionComponent],
      providers: [
        TranslateService,
        provideMockStore({
          initialState: {
            metadata: metadata,
            area: area,
            scenario: scenario,
            user: { baseline: undefined }
          }
        }),
        provideZonelessChangeDetection()
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(MatrixSelectionComponent);
    component = fixture.componentInstance;
    component.scenario = testScenario;
    component.areaIndex = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

@Component({
  selector: 'app-matrix-with-language-dialog-host',
  template: `
    <app-matrix-selection [scenario]="scenario" [areaIndex]="0"></app-matrix-selection>
    <app-change-language-dialog></app-change-language-dialog>
  `,
  standalone: false
})
class MatrixWithLanguageDialogHost {
  scenario: Scenario = testScenario;
}

@Component({
  selector: 'app-matrix-with-baseline-dialog-host',
  template: `
    <app-matrix-selection [scenario]="scenario" [areaIndex]="0"></app-matrix-selection>
    <app-change-baseline-dialog></app-change-baseline-dialog>
  `,
  standalone: false
})
class MatrixWithBaselineDialogHost {
  scenario: Scenario = testScenario;
}

const twoBaselines: Baseline[] = [
  { id: 1, name: 'one', title: 'One', description: '', locale: 'sv', validFrom: 0 },
  { id: 2, name: 'two', title: 'Two', description: '', locale: 'sv', validFrom: 0 }
];

describe('MatrixSelectionComponent next to another dialog', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslationSetupModule,
        MatRadioModule,
        MatSelectModule,
        TranslateSpecModule
      ],
      declarations: [
        MatrixSelectionComponent,
        ChangeLanguageDialogComponent,
        ChangeBaselineDialogComponent,
        MatrixWithLanguageDialogHost,
        MatrixWithBaselineDialogHost
      ],
      providers: [
        TranslateService,
        { provide: DialogRef, useValue: {} },
        provideMockActions(() => EMPTY),
        provideMockStore({
          initialState: {
            metadata: metadata,
            area: area,
            scenario: scenario,
            user: {
              ...user,
              baseline: twoBaselines[0],
              availableBaselines: twoBaselines
            }
          }
        }),
        provideZonelessChangeDetection()
      ]
    }).compileComponents();
    TestBed.inject(TranslateService).addLangs(['en', 'sv', 'fr']);
  });

  function matrixRadios(fixture: ComponentFixture<unknown>): MatRadioButton[] {
    return fixture.debugElement
      .queryAll(By.css('app-matrix-selection mat-radio-button'))
      .map((d) => d.componentInstance as MatRadioButton);
  }

  it('keeps the standard matrix radio checked when the change-language dialog renders', () => {
    const fixture = TestBed.createComponent(MatrixWithLanguageDialogHost);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(matrixRadios(fixture)[0].checked).toBeTrue();
  });

  it('keeps the standard matrix radio checked when the change-baseline dialog renders', () => {
    const fixture = TestBed.createComponent(MatrixWithBaselineDialogHost);
    expect(() => fixture.detectChanges()).not.toThrow();
    const dialogRadios = fixture.debugElement
      .queryAll(By.css('app-change-baseline-dialog mat-radio-button'))
      .map((d) => d.componentInstance as MatRadioButton);
    expect(dialogRadios.length).toBe(2);
    expect(dialogRadios[0].checked).toBeTrue();
    expect(matrixRadios(fixture)[0].checked).toBeTrue();
  });

  it('keeps the custom matrix radio checked when the change-language dialog renders', () => {
    const fixture = TestBed.createComponent(MatrixWithLanguageDialogHost);
    const [firstArea, ...otherAreas] = testScenario.areas;
    fixture.componentInstance.scenario = {
      ...testScenario,
      areas: [{ ...firstArea, matrix: { matrixType: 'CUSTOM', matrixId: 7 } }, ...otherAreas]
    };
    expect(() => fixture.detectChanges()).not.toThrow();
    const radios = matrixRadios(fixture);
    expect(radios[radios.length - 1].checked).toBeTrue();
    expect(radios[0].checked).toBeFalse();
  });
});

describe('MatrixSelectionComponent default-matrix label', () => {
  const defaultMatrix: MatrixRef = { id: 1, name: 'Default', immutable: true };
  const matrixData: AreaMatrixData = {
    defaultArea: {
      id: 10,
      name: 'Östersjön',
      defaultMatrix,
      matrices: [],
      userDefinedMatrices: [],
      commonBaselineMatrices: []
    },
    areaTypes: [],
    overlap: [],
    alternativeMatrices: null
  };

  let translate: TranslateService;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslationSetupModule,
        MatRadioModule,
        MatSelectModule,
        TranslateSpecModule
      ],
      declarations: [MatrixSelectionComponent],
      providers: [
        TranslateService,
        provideMockStore({
          initialState: {
            metadata: metadata,
            area: area,
            scenario: scenario,
            user: { baseline: undefined }
          }
        }),
        provideZonelessChangeDetection()
      ]
    }).compileComponents();
    translate = TestBed.inject(TranslateService);
    translate.setTranslation(
      'sv',
      { map: { editor: { matrix: { 'default-matrix': 'Standardmatris' } } } },
      true
    );
    translate.setTranslation(
      'en',
      { map: { editor: { matrix: { 'default-matrix': 'Default matrix' } } } },
      true
    );
    translate.use('sv');
    store = TestBed.inject(MockStore);
  });

  function render(data: AreaMatrixData): ComponentFixture<MatrixSelectionComponent> {
    store.overrideSelector(ScenarioSelectors.selectActiveAreaMatrixData, data);
    const fixture = TestBed.createComponent(MatrixSelectionComponent);
    fixture.componentInstance.scenario = testScenario;
    fixture.componentInstance.areaIndex = 0;
    fixture.detectChanges();
    return fixture;
  }

  function standardRadioText(fixture: ComponentFixture<MatrixSelectionComponent>): string {
    const radio = fixture.debugElement.query(By.css('mat-radio-button'));
    return (radio.nativeElement as HTMLElement).textContent!.trim();
  }

  it('shows the default-matrix label in the new language after a switch', async () => {
    const fixture = render(matrixData);
    expect(standardRadioText(fixture)).toBe('Standardmatris (Östersjön)');

    translate.use('en');
    await fixture.whenStable();

    expect(standardRadioText(fixture)).toBe('Default matrix (Östersjön)');
  });

  it('follows the language when the area has no default-area name', async () => {
    const fixture = render({
      ...matrixData,
      defaultArea: null,
      alternativeMatrices: [{ id: 2, name: 'Alternative', immutable: true }]
    });
    expect(standardRadioText(fixture)).toBe('Standardmatris');

    translate.use('en');
    await fixture.whenStable();

    expect(standardRadioText(fixture)).toBe('Default matrix');
  });
});
