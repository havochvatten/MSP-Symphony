import { Component, NgModuleRef, OnDestroy, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { ScenarioActions, ScenarioSelectors } from '@data/scenario';
import { lastValueFrom, Observable, of, Subscription } from 'rxjs';
import { Scenario, ScenarioCopyOptions } from '@data/scenario/scenario.interfaces';
import { Area } from '@data/area/area.interfaces';
import { AreaSelectors } from '@data/area';
import { catchError, map } from 'rxjs/operators';
import { CalculationReportModalComponent } from '@shared/report-modal/calculation-report-modal.component';
import { DialogService } from '@shared/dialog/dialog.service';
import * as Normalization from '@src/app/map-view/scenario/scenario-detail/normalization-selection/normalization-selection.component';
import { TranslateService } from '@ngx-translate/core';
import { deleteScenario } from "@src/app/map-view/scenario/scenario-common";
import { AddScenarioAreasComponent } from "@src/app/map-view/scenario/add-scenario-areas/add-scenario-areas.component";
import { CopyScenarioComponent } from "@src/app/map-view/scenario/copy-scenario/copy-scenario.component";
import { Listable } from "@shared/list-filter/listable.directive";
import { ListItemsSort } from "@data/common/sorting.interfaces";
import { CalculationService } from "@data/calculation/calculation.service";
import { ConfirmationModalComponent } from "@shared/confirmation-modal/confirmation-modal.component";

@Component({
    selector: 'app-scenario-list',
    templateUrl: './scenario-list.component.html',
    styleUrls: ['./scenario-list.component.scss', '../../list-actions.scss']
})
export class ScenarioListComponent extends Listable implements OnDestroy {

  scenario$ = this.store.select(ScenarioSelectors.selectScenarios);

  selectedAreas: Area[] = [];
  ABUNDANT_AREA_COUNT = 4;
  MAX_AREAS = 9;

  selectedBatchIds: number[] = [];

  private areaSubscription$: Subscription;
  private autoBatchSubscription$: Subscription;
  public selectionOverlap: Observable<boolean>;

  isBatchMode = signal<boolean>(false);

  constructor(
    protected store: Store<State>,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private calculationService: CalculationService,
    private moduleRef: NgModuleRef<never>
  ) {
    super();
    this.areaSubscription$ = this.store
      .select(AreaSelectors.selectSelectedAreaData)
      .subscribe(area => (this.selectedAreas = area as Area[]));

    this.selectionOverlap = this.store
        .select(AreaSelectors.selectOverlap);

    this.autoBatchSubscription$ = this.store
      .select(ScenarioSelectors.selectAutoBatch).subscribe(
        (autoBatch) => {
          if(autoBatch && autoBatch.length > 0) {
            this.isBatchMode.set(true);
            this.selectedBatchIds = autoBatch;
            this.store.dispatch(ScenarioActions.resetAutoBatch());
          }
        }
      );
  }

  setSort(sortType: ListItemsSort): void {
      this.store.dispatch(ScenarioActions.setScenarioSortType({ sortType }));
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
    if(!this.isBatchMode()) {
      this.store.dispatch(ScenarioActions.openScenario({ index: index }));
    }
  }

  showReport(id: number) {
    this.dialogService.open(CalculationReportModalComponent, this.moduleRef, {
      data: { id }
    });
  }

  async deleteScenario(scenario: Scenario) {
    await deleteScenario(this.dialogService, this.translateService, this.store, this.moduleRef, scenario);
  }

  async copyScenario(scenario: Scenario) {
    const copyOptions = await this.dialogService.open<ScenarioCopyOptions>(
      CopyScenarioComponent,
      this.moduleRef,
      {data: { scenario }}
    );

    if (copyOptions) {
      this.store.dispatch(ScenarioActions.copyScenario({ scenarioId: scenario.id, options: copyOptions }));
    }
  }

  ngOnDestroy() {
      this.areaSubscription$.unsubscribe();
      this.autoBatchSubscription$.unsubscribe();
  }

  triggerBatchRun = async () => {
    if(this.isBatchMode() && this.selectedBatchIds.length > 1) {
      this.calculationService.queueBatchCalculation(this.selectedBatchIds);
    }
  }

  disableBatch = () => { return !(this.isBatchMode() && this.selectedBatchIds.length > 1) };
  noneSelected = () => { return !(this.isBatchMode() && this.selectedBatchIds.length > 0) };
  deleteSelectedScenarios = async () => {
    if (this.selectedBatchIds.length === 1) {
      const selectedScenario = await
        lastValueFrom(this.scenario$.pipe(
          map(scenarios => scenarios.find(s => s.id === this.selectedBatchIds[0]))
        ));
      if (selectedScenario) {
        await this.deleteScenario(selectedScenario)
      }
    }
    if (this.selectedBatchIds.length > 1) {
      const confirmDeleteMany = await this.dialogService.open<boolean>(
        ConfirmationModalComponent, this.moduleRef,
        {
          data: {
            header: this.translateService.instant('map.editor.delete.modal.title-many'),
            message: this.translateService.instant('map.editor.delete.modal.message-many', { count: this.selectedBatchIds.length }),
            confirmText: this.translateService.instant('map.editor.delete.modal.delete'),
            confirmColor: 'warn',
            dialogClass: 'center'
          }
        });
      if (confirmDeleteMany) {
        this.store.dispatch(ScenarioActions.deleteMultipleScenarios({ scenarioIds: this.selectedBatchIds }));
        this.selectedBatchIds = [];
        this.isBatchMode.set(false);
      }
    }
  }

  async selectForBatch(id: number) {
    if(!this.selectedBatchIds.includes(id)) {
      this.selectedBatchIds.push(id);
    } else {
      this.selectedBatchIds = this.selectedBatchIds.filter(i => i !== id);
    }
  }
}
