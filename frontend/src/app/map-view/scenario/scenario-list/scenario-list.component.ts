import { Component, NgModuleRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { ScenarioService } from '@data/scenario/scenario.service';
import { ScenarioActions, ScenarioSelectors } from '@data/scenario';
import { Observable, of } from 'rxjs';
import { Scenario, ScenarioArea } from '@data/scenario/scenario.interfaces';
import { Area } from '@data/area/area.interfaces';
import { AreaSelectors } from '@data/area';
import { catchError } from 'rxjs/operators';
import { CalculationReportModalComponent } from '@shared/report-modal/calculation-report-modal.component';
import { DialogService } from '@shared/dialog/dialog.service';
import { UserSelectors } from '@data/user';
import { Baseline } from '@data/user/user.interfaces';
import * as Normalization from '@src/app/map-view/scenario/scenario-detail/normalization-selection/normalization-selection.component';
import { TranslateService } from '@ngx-translate/core';
import { MetadataSelectors } from '@data/metadata';
import { Band } from '@data/metadata/metadata.interfaces';
import { deleteScenario } from "@src/app/map-view/scenario/scenario-common";

@Component({
  selector: 'app-scenario-list',
  templateUrl: './scenario-list.component.html',
  styleUrls: ['./scenario-list.component.scss']
})
export class ScenarioListComponent {
  selectedAreas: Area[] = [];
  baseline?: Baseline;
  selectedComponents?: { ecoComponent: Band[]; pressureComponent: Band[] };

  scenarios$: Observable<Scenario[]>;

  constructor(
    private store: Store<State>,
    private scenarioService: ScenarioService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private moduleRef: NgModuleRef<any>
  ) {
    this.scenarios$ = this.store.select(ScenarioSelectors.selectScenarios);

    this.store
      .select(AreaSelectors.selectSelectedAreaData)
      .subscribe(area => (this.selectedAreas = area as Area[]));
    this.store
      .select(UserSelectors.selectBaseline)
      .subscribe(baseline => (this.baseline = baseline));
    this.store
      .select(MetadataSelectors.selectSelectedComponents)
      .subscribe(components => (this.selectedComponents = components));
  }

  /* Create new scenario in selected area, and enter it */
  async createScenario(areas: Area[]) {

    const name = (areas.length === 1 ?
      this.translateService.instant('map.editor.list.scenario-name-template', {
        area: areas[0].name
      }) :
      this.translateService.instant('map.editor.list.scenario-name')),
      s_areas = areas.map(area => ({
        id: -1,
        feature: area.feature,
        changes: null,
        excludedCoastal: -1, // "magic" number to prevent inclusion by default
        matrix: { matrixType: 'STANDARD', matrixId: undefined },
        scenarioId: -1 })) as ScenarioArea[]

    this.scenarioService
      .create(
        this.baseline!,
        name,
        s_areas,
        Normalization.DEFAULT_OPTIONS,
        this.selectedComponents?.ecoComponent.map(band => band.bandNumber) ?? [],
        this.selectedComponents?.pressureComponent.map(band => band.bandNumber) ?? []
      )
      .pipe(catchError(error => of(error)))
      .subscribe((scenario: Scenario) =>
        this.store.dispatch(ScenarioActions.addScenario({ scenario }))
      );
  }

  open(index: number) {
    this.store.dispatch(ScenarioActions.openScenario({ index: index }));
  }

  showReport(id: number) {
    this.dialogService.open(CalculationReportModalComponent, this.moduleRef, {
      data: { id }
    });
  }

  openScenarioArea(scenarioIndex: number, areaIndex: number) {
    this.store.dispatch(ScenarioActions.openScenarioArea({ index: areaIndex, scenarioIndex: scenarioIndex }));
  }

  async deleteScenario(scenario: Scenario) {
    await deleteScenario(this.dialogService, this.translateService, this.store, this.moduleRef, scenario);
  }
}
