import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { isEmpty } from "@shared/common.util";
import { MatRadioChange, MatRadioGroup } from "@angular/material/radio";
import { MAT_SELECT_CONFIG, MatSelectChange } from "@angular/material/select";
import { State } from "@src/app/app-reducer";
import { ScenarioSelectors } from "@data/scenario";
import { ChangesProperty, Scenario, ScenarioArea, ScenarioChangesSelection } from "@data/scenario/scenario.interfaces";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "@shared/dialog/dialog-config";

interface ScenarioWithChanges {
  scenario: Scenario;
  hasGlobalChanges: boolean;
  hasAreaChanges: boolean;
}

@Component({
  selector: 'app-transfer-changes',
  templateUrl: './transfer-changes.component.html',
  styleUrls: ['./transfer-changes.component.scss']
})
export class TransferChangesComponent {

  targetChanges: Scenario | ScenarioArea;
  @ViewChild('changesSelection') changesSelection!: MatRadioGroup;
  public scenarios$: Observable<ScenarioWithChanges[]>;
  private selectableAreas: ScenarioArea[] = [];
  public selectedScenario: ScenarioWithChanges | null = null;
  public selectedChange: number | null = null;

  selectedChanges: ScenarioChangesSelection = {
    scenarioId: null,
    areaId: null,
    overwrite: false
  };

  constructor(
    public dialog: DialogRef,
    private config: DialogConfig,
    private store: Store<State>) {
    this.targetChanges = config.data.target;
    this.scenarios$ = this.store.select(ScenarioSelectors.selectScenarios).pipe(
      map(scenarios => scenarios.map(scenario => {
        const hasGlobalChanges = !isEmpty(scenario.changes) && scenario !== this.targetChanges;
        const hasAreaChanges = scenario.areas.some(area => !isEmpty(area.changes));
        return {
          scenario,
          hasGlobalChanges,
          hasAreaChanges,
        } as ScenarioWithChanges;
      }).filter(scenario => (scenario.hasGlobalChanges && scenario.scenario !== this.targetChanges) || scenario.hasAreaChanges)),
    );
  }

  async onScenarioChange($event: MatSelectChange) {
    this.selectedScenario = $event.value;
    if(this.selectedScenario !== null) {
      this.selectableAreas = $event.value.scenario.areas.filter((area: { changes: ChangesProperty }) => !isEmpty(area.changes) && area !== this.targetChanges.changes);
      this.selectedChanges.scenarioId = this.selectedScenario.hasGlobalChanges ? $event.value.scenario.id : null;
      this.selectedChanges.areaId = this.selectedScenario.hasGlobalChanges ? null : this.selectableAreas[0].id;

      this.selectedChange = this.selectedScenario.hasGlobalChanges ? -1 : this.selectableAreas[0].id;
    }
  }

  getSelectableAreas(): ScenarioArea[] {
    return this.selectableAreas;
  }

  async setChangesToTransfer($event: MatRadioChange) {
    if($event.value === -1) {
      this.selectedChanges.scenarioId = this.selectedScenario?.scenario.id ?? null;
      this.selectedChanges.areaId = null;
    } else {
      this.selectedChanges.scenarioId = null;
      this.selectedChanges.areaId = $event.value;
    }
    this.selectedChange = $event.value;
  }

  noSelection(): boolean {
    return this.selectedChanges.scenarioId === null && this.selectedChanges.areaId === null;
  }

  confirmTransferChanges() {
    this.dialog.close(this.selectedChanges);
  }
}
