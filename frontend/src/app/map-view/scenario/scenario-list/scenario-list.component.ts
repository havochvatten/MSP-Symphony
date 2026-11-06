import { Component, OnDestroy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { ScenarioActions, ScenarioSelectors } from '@data/scenario';
import { firstValueFrom, Observable, of, Subscription } from 'rxjs';
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
import {
  NewScenarioNameComponent, NewScenarioNameData
} from "@src/app/map-view/scenario/new-scenario-name/new-scenario-name.component";
import { uniqueScenarioName } from "@src/app/map-view/scenario/unique-scenario-name";
import { ListItemsSort } from "@data/common/sorting.interfaces";
import { CalculationService } from "@data/calculation/calculation.service";
import { MultiModeListable } from "@shared/multi-tools/multi-mode-listable";
import { ScenarioEditorModule } from "@src/app/map-view/scenario/scenario-editor.module";

@Component({
    selector: 'app-scenario-list',
    templateUrl: './scenario-list.component.html',
    styleUrls: ['./scenario-list.component.scss'],
    standalone: false
})
export class ScenarioListComponent extends MultiModeListable implements OnDestroy {
  protected store = inject<Store<State>>(Store);
  private readonly translateService = inject(TranslateService);
  private readonly calculationService = inject(CalculationService);
  protected dialogService: DialogService = inject(DialogService);

  scenario$ = this.store.select(ScenarioSelectors.selectScenarios);

  selectedAreas: Area[] = [];
  ABUNDANT_AREA_COUNT = 4;
  MAX_AREAS = 9;

  private readonly areaSubscription$: Subscription;
  private readonly autoBatchSubscription$: Subscription;
  public selectionOverlap: Observable<boolean>;

  constructor() {
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
            this.isMultiMode.set(true);
            this.selectedIds = autoBatch;
            this.store.dispatch(ScenarioActions.resetAutoBatch());
          }
        }
      );
  }

  setSort(sortType: ListItemsSort): void {
      this.store.dispatch(ScenarioActions.setScenarioSortType({ sortType }));
  }

  /* Ask for a name, then create a new scenario in the selected areas */
  createScenario = async (areas: Area[], that: AddScenarioAreasComponent): Promise<void> => {
    // `that` is the + button, which supplies the current selection and the scenario service.
    // Read the selection now, so that changes made while the dialog is open do not leak in.
    const components = that.selectedComponents!,
      baseline = that.baseline!,
      baseName = (areas.length === 1 ?
      this.translateService.instant('map.editor.list.scenario-name-template', {
        area: areas[0].name
      }) :
      this.translateService.instant('map.editor.list.scenario-name')),
      existingNames = (await firstValueFrom(this.scenario$)).map(s => s.name);

    const name = await this.dialogService.open<string | null, ScenarioEditorModule>(
      NewScenarioNameComponent,
      this.moduleRef,
      { data: { suggestedName: uniqueScenarioName(baseName, existingNames) } as NewScenarioNameData }
    );

    if (!name) {
      return;
    }

    that.scenarioService
      .create(
        baseline,
        name,
        that.scenarioService.convertAreas(areas),
        Normalization.DEFAULT_OPTIONS,
        components.ecoComponent.map(band => band.bandNumber) ?? [],
        components.pressureComponent.map(band => band.bandNumber) ?? []
      )
      .pipe(catchError(error => of(error)))
      .subscribe((scenario: Scenario) =>
        this.store.dispatch(ScenarioActions.addScenario({ scenario }))
      );
  }

  open(index: number) {
    if(!this.isMultiMode()) {
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
    const copyOptions = await this.dialogService.open<ScenarioCopyOptions, ScenarioEditorModule>(
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
    if(this.isMultiMode() && this.selectedIds.length > 1) {
      this.calculationService.queueBatchCalculation(this.selectedIds);
    }
  }

  disableBatch = () => { return !(this.isMultiMode() && this.selectedIds.length > 1) };
  deleteSelectedScenarios = async () => {
    if (this.selectedIds.length === 1) {
      const selectedScenario = await
        firstValueFrom(this.scenario$.pipe(
          map(scenarios => scenarios.find(s => s.id === this.selectedIds[0]))
        ));
      if (selectedScenario) {
        await this.deleteScenario(selectedScenario)
      }
    }
    if (this.selectedIds.length > 1) {
      await this.deleteSelected({
          data: {
            header: this.translateService.instant('map.editor.delete.modal.title-many'),
            message: this.translateService.instant('map.editor.delete.modal.message-many', { count: this.selectedIds.length }),
            confirmText: this.translateService.instant('map.editor.delete.modal.delete'),
            confirmColor: 'warn',
            dialogClass: 'center'
          }
        }, () => {
        this.store.dispatch(ScenarioActions.deleteMultipleScenarios({ scenarioIds: this.selectedIds }));
      });
    }
  }
}
