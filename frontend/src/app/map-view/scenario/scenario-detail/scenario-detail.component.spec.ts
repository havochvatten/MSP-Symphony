import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenarioDetailComponent } from './scenario-detail.component';
import { StoreModule } from '@ngrx/store';
import { provideHttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { TranslateSpecModule } from '@src/testing/translate-spec.module';
import { NormalizationType } from '@data/calculation/calculation.service';
import { MatRadioButton, MatRadioModule } from '@angular/material/radio';
import { IconComponent } from '@shared/icon/icon.component';
import { provideMockStore } from '@ngrx/store/testing';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { initialState as scenario } from '@data/scenario/scenario.reducers';
import { initialState as calculation } from '@data/calculation/calculation.reducers';
import { initialState as area } from '@data/area/area.reducers';
import { MatrixSelectionComponent } from '@src/app/map-view/scenario/scenario-area-detail/matrix-selection/matrix-selection.component';
import { NormalizationSelectionComponent } from '@src/app/map-view/scenario/scenario-detail/normalization-selection/normalization-selection.component';
import { AddScenarioAreasComponent } from '@src/app/map-view/scenario/add-scenario-areas/add-scenario-areas.component';
import { OrdinalPipe } from '@shared/ordinal.pipe';
import { ChangesListComponent } from '@src/app/map-view/scenario/scenario-detail/changes-list/changes-list.component';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MockStore } from '@ngrx/store/testing';
import { Scenario } from '@data/scenario/scenario.interfaces';
import { ScenarioActions } from '@data/scenario';
import { ChangeLanguageDialogComponent } from '@shared/change-language-dialog/change-language-dialog.component';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { IconButtonComponent } from '@shared/icon-button/icon-button.component';

describe('ScenarioDetailComponent', () => {
  let component: ScenarioDetailComponent;
  let fixture: ComponentFixture<ScenarioDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}, {}), TranslateSpecModule, MatRadioModule],
      providers: [
        TranslateService,
        OrdinalPipe,
        provideHttpClient(),
        provideMockStore({
          initialState: {
            metadata: metadata,
            scenario: scenario,
            calculation: calculation,
            area: area,
            user: { baseline: undefined }
          }
        }),
        provideZonelessChangeDetection()
      ],
      declarations: [
        ScenarioDetailComponent,
        MatrixSelectionComponent,
        NormalizationSelectionComponent,
        AddScenarioAreasComponent,
        ChangesListComponent,
        OrdinalPipe,
        IconComponent,
        IconButtonComponent
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ScenarioDetailComponent);
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
      areas: [],
      latestCalculationId: null
    };
    component.ngAfterContentInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

const rarityScenario: Scenario = {
  operation: 1,
  operationOptions: { domain: 'GLOBAL' },
  id: -1,
  timestamp: 0,
  baselineId: 0,
  changes: {},
  ecosystemsToInclude: [],
  name: '',
  // Rarity with DOMAIN normalization makes the selection emit AREA during change detection.
  normalization: { type: NormalizationType.AREA },
  pressuresToInclude: [],
  areas: [],
  latestCalculationId: null
};

@Component({
  selector: 'app-scenario-detail-with-language-dialog-host',
  template: `
    <app-scenario-detail [scenario]="scenario"></app-scenario-detail>
    @if (showDialog()) {
      <app-change-language-dialog></app-change-language-dialog>
    }
  `,
  standalone: false
})
class ScenarioDetailWithLanguageDialogHost {
  scenario: Scenario = rarityScenario;
  showDialog = signal(false);
}

describe('ScenarioDetailComponent rarity domain radios', () => {
  let store: MockStore;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}, {}),
        TranslateSpecModule,
        MatRadioModule,
        ReactiveFormsModule
      ],
      providers: [
        TranslateService,
        OrdinalPipe,
        provideHttpClient(),
        { provide: DialogRef, useValue: {} },
        provideMockStore({
          initialState: {
            metadata: metadata,
            scenario: scenario,
            calculation: calculation,
            area: area,
            user: { baseline: undefined }
          }
        }),
        provideZonelessChangeDetection()
      ],
      declarations: [
        ScenarioDetailComponent,
        MatrixSelectionComponent,
        NormalizationSelectionComponent,
        AddScenarioAreasComponent,
        ChangesListComponent,
        OrdinalPipe,
        IconComponent,
        IconButtonComponent,
        ChangeLanguageDialogComponent,
        ScenarioDetailWithLanguageDialogHost
      ]
    }).compileComponents();
    TestBed.inject(TranslateService).addLangs(['en', 'sv']);
    store = TestBed.inject(MockStore);
  });

  async function render() {
    const fixture = TestBed.createComponent(ScenarioDetailWithLanguageDialogHost);
    fixture.detectChanges();
    // The operation form control is set in a timeout in ngAfterContentInit.
    await new Promise<void>((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    await fixture.whenStable();
    // The dialog opens over the editor after the rarity radios already exist.
    fixture.componentInstance.showDialog.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  function domainRadios(fixture: ComponentFixture<unknown>): MatRadioButton[] {
    return fixture.debugElement
      .queryAll(By.css('app-scenario-detail .algorithm article:nth-of-type(2) mat-radio-button'))
      .map((d) => d.componentInstance as MatRadioButton);
  }

  it('keeps the selected domain radio checked when the change-language dialog opens later', async () => {
    const fixture = await render();
    const dialogRadios = fixture.debugElement.queryAll(
      By.css('app-change-language-dialog mat-radio-button')
    );
    expect(dialogRadios.length).toBeGreaterThan(0);
    const radios = domainRadios(fixture);
    expect(radios.length).toBe(2);
    expect(radios[0].value).toBe('GLOBAL');
    expect(radios[0].checked).toBeTrue();
    expect(radios[1].checked).toBeFalse();
  });

  it('dispatches the chosen domain when LOCAL is selected', async () => {
    const fixture = await render();
    const dispatchSpy = spyOn(store, 'dispatch');
    const local = domainRadios(fixture)[1];

    (local._inputElement.nativeElement as HTMLInputElement).click();

    expect(dispatchSpy).toHaveBeenCalledWith(
      ScenarioActions.changeScenarioOperationParams({ operationParams: { domain: 'LOCAL' } })
    );
  });
});
