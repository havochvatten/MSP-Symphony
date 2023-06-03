import { Component, NgModuleRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { ScenarioActions, ScenarioSelectors } from '@data/scenario';
import { Observable, of, Subscription } from 'rxjs';
import { Scenario, ScenarioArea } from '@data/scenario/scenario.interfaces';
import { Area } from '@data/area/area.interfaces';
import { AreaSelectors } from '@data/area';
import { catchError } from 'rxjs/operators';
import { CalculationReportModalComponent } from '@shared/report-modal/calculation-report-modal.component';
import { DialogService } from '@shared/dialog/dialog.service';
import * as Normalization from '@src/app/map-view/scenario/scenario-detail/normalization-selection/normalization-selection.component';
import { TranslateService } from '@ngx-translate/core';
import { deleteScenario } from "@src/app/map-view/scenario/scenario-common";
import { AddScenarioAreasComponent } from "@src/app/map-view/scenario/add-scenario-areas/add-scenario-areas.component";

@Component({
  selector: 'app-scenario-list',
  templateUrl: './scenario-list.component.html',
  styleUrls: ['./scenario-list.component.scss']
})
export class ScenarioListComponent {
  scenarios$: Observable<Scenario[]>;
  selectedAreas: Area[] = [];
  ABUNDANT_AREA_COUNT = 4;
  MAX_AREAS = 9;

  private areaSubscription$: Subscription;

  constructor(
    private store: Store<State>,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private moduleRef: NgModuleRef<any>
  ) {
    this.scenarios$ = this.store.select(ScenarioSelectors.selectScenarios);
    this.areaSubscription$ = this.store
      .select(AreaSelectors.selectSelectedAreaData)
      .subscribe(area => (this.selectedAreas = area as Area[]));
  }

  /* Create new scenario in selected area, and enter it */
  async createScenario(areas: Area[], that: AddScenarioAreasComponent) {
    // We could actually use "this" in place of ´that´ here and omit the
    // component reference. But that'd require us to us to provide dummy
    // properties and needlessly injected services in the containing class,
    // just to keep Angular happy at compile time.
    // Note that the ScenarioListComponent context really is inaccessible,
    // as this method is to be called as a delegate only.

    const components = that.selectedComponents!,
      name = (areas.length === 1 ?
      that.translateService.instant('map.editor.list.scenario-name-template', {
        area: areas[0].name
      }) :
      that.translateService.instant('map.editor.list.scenario-name'));

    that.scenarioService
      .create(
        that.baseline!,
        name,
        that.scenarioService.convertAreas(areas),
        Normalization.DEFAULT_OPTIONS,
        components.ecoComponent.map(band => band.bandNumber) ?? [],
        components.pressureComponent.map(band => band.bandNumber) ?? []
      )
      .pipe(catchError(error => of(error)))
      .subscribe((scenario: Scenario) =>
        that.store.dispatch(ScenarioActions.addScenario({ scenario }))
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

  async deleteScenario(scenario: Scenario) {
    await deleteScenario(this.dialogService, this.translateService, this.store, this.moduleRef, scenario);
  }

  ngOnDestroy() {
    this.areaSubscription$.unsubscribe();
  }
}
