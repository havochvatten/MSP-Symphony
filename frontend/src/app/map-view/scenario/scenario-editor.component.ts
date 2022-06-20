import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Scenario } from "@data/scenario/scenario.interfaces";
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";
import { ScenarioActions, ScenarioSelectors } from "@data/scenario";

@Component({
  selector: 'app-scenario-editor',
  templateUrl: './scenario-editor.component.html',
})
export class ScenarioEditorComponent {
  activeScenario?: Scenario;

  constructor(
    private store: Store<State>,
  ) {
    this.store.dispatch(ScenarioActions.fetchScenarios());
    this.store.select(ScenarioSelectors.selectActiveScenario)
      .subscribe(scenario => this.activeScenario = scenario);
  }
}
