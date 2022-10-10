import { Component, NgModuleRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { ScenarioService } from '@data/scenario/scenario.service';
import { ScenarioActions, ScenarioSelectors } from '@data/scenario';
import { Observable, of } from 'rxjs';
import { Scenario } from '@data/scenario/scenario.interfaces';
import { Area } from '@data/area/area.interfaces';
import { AreaSelectors } from '@data/area';
import { catchError } from 'rxjs/operators';
import { CalculationReportModalComponent } from '@shared/report-modal/calculation-report-modal.component';
import { DialogService } from '@shared/dialog/dialog.service';
import { UserSelectors } from '@data/user';
import { Baseline } from '@data/user/user.interfaces';
import * as Normalization from '@src/app/map-view/scenario/scenario-detail/normalization-selection/normalization-selection.component';
import { TranslateService } from '@ngx-translate/core';
import { selectSelectedComponents } from '@data/metadata/metadata.selectors';
import { MetadataSelectors } from '@data/metadata';
import { Band } from '@data/metadata/metadata.interfaces';

@Component({
  selector: 'app-scenario-list',
  templateUrl: './scenario-list.component.html',
  styleUrls: ['./scenario-list.component.scss']
})
export class ScenarioListComponent {
  selectedArea?: Area;
  baseline?: Baseline;
  selectedComponents?: { ecoComponent: Band[]; pressureComponent: Band[] };

  scenarios$: Observable<Scenario[]>;
  activeScenarioIndex?: number;

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
      .subscribe(area => (this.selectedArea = area as Area));
    this.store
      .select(UserSelectors.selectBaseline)
      .subscribe(baseline => (this.baseline = baseline));
    this.store
      .select(MetadataSelectors.selectSelectedComponents)
      .subscribe(components => (this.selectedComponents = components));
  }

  /* Create new scenario in selected area, and enter it */
  async createScenario(area: Area) {
    const name = await this.translateService
      .get('map.editor.list.scenario-name-template', {
        area: area.name
      })
      .toPromise();
    this.scenarioService
      .create(
        this.baseline!,
        name,
        area.feature, // TODO create feature from geometry?
        Normalization.DEFAULT_OPTIONS,
        this.selectedComponents?.ecoComponent.map(band => band.bandNumber) ?? [],
        this.selectedComponents?.pressureComponent.map(band => band.bandNumber) ?? []
      )
      .pipe(catchError(error => of(error)))
      .subscribe((scenario: Scenario) =>
        this.store.dispatch(ScenarioActions.addScenario({ scenario }))
      ); // TODO retry a few times in case server is not reachable atm?
  }

  open(s: Scenario, index: number) {
    this.store.dispatch(ScenarioActions.openScenario({ scenario: s, index: index }));
  }

  showReport(id: string) {
    this.dialogService.open(CalculationReportModalComponent, this.moduleRef, {
      data: { id }
    });
  }
}
