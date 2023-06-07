import { Component, NgModuleRef } from '@angular/core';
import { Scenario } from "@data/scenario/scenario.interfaces";
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";
import { ScenarioActions, ScenarioSelectors } from "@data/scenario";
import {
  AreaMatrixData,
} from "@src/app/map-view/scenario/scenario-area-detail/matrix-selection/matrix.interfaces";
import { ConfirmationModalComponent } from "@shared/confirmation-modal/confirmation-modal.component";
import { TranslateService } from "@ngx-translate/core";
import { DialogService } from "@shared/dialog/dialog.service";
import { Observable } from "rxjs";

@Component({
  selector: 'app-scenario-editor',
  templateUrl: './scenario-editor.component.html',
})
export class ScenarioEditorComponent {
  activeScenario?: Scenario;
  activeAreaIndex?: number;
  matrixData?: Observable<AreaMatrixData | null>;

  constructor(
    private translateService: TranslateService,
    private dialogService: DialogService,
    private moduleRef: NgModuleRef<any>,
    private store: Store<State>,
  ) {
    this.store.dispatch(ScenarioActions.fetchScenarios());
    this.store.select(ScenarioSelectors.selectActiveScenario)
      .subscribe(scenario => this.activeScenario = scenario);
    this.store.select(ScenarioSelectors.selectActiveScenarioArea)
      .subscribe(areaIndex => this.activeAreaIndex = areaIndex);
  }

  getActiveAreaIndex(): number | undefined {
    return this.activeAreaIndex;
  }

  getActiveScenario() {
    return this.activeScenario;
  }

  confirmDeleteArea = async(areaId: number, $event: MouseEvent, scenario: Scenario | undefined) => {
    $event.stopPropagation();

    if(scenario === undefined) return;

    const area = scenario.areas.find(a => a.id === areaId);

    if(area) {
      const param = { scenario: scenario.name, area: area.feature.properties!['name'] },
        confirmDeleteArea = await this.dialogService.open<boolean>(
          ConfirmationModalComponent, this.moduleRef,
          {
            data: {
              header: `${this.translateService.instant('map.editor.areas.remove.modal.title')}`,
              message : `${this.translateService.instant('map.editor.areas.remove.modal.message', param)}` +
                (scenario.areas.length > 1 ? '' : '<br>' +
                  `${this.translateService.instant('map.editor.areas.remove.modal.message-last', param)}`),
              confirmText: this.translateService.instant('map.editor.areas.remove.modal.confirm'),
              confirmColor: 'warn',
              dialogClass: 'center wide1'
            }
          });
      if (confirmDeleteArea) {
        this.store.dispatch(ScenarioActions.closeActiveScenarioArea());
        if (scenario.areas.length > 1) {
          this.store.dispatch(ScenarioActions.deleteScenarioArea({areaId}));
        } else {
          this.store.dispatch(ScenarioActions.deleteScenario({scenarioToBeDeleted: scenario}));
        }
      }
    }
  }
}
