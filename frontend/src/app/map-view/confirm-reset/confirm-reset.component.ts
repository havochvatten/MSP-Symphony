import { Component, OnInit } from '@angular/core';
import { Store } from "@ngrx/store";
import { first } from "rxjs/operators";
import { State } from "@src/app/app-reducer";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { MetadataActions } from "@data/metadata";
import { ScenarioActions, ScenarioSelectors } from "@data/scenario";
import { UserSelectors } from "@data/user";
import { Scenario } from "@data/scenario/scenario.interfaces";

@Component({
  selector: 'app-confirm-reset',
  templateUrl: './confirm-reset.component.html',
  styleUrls: ['./confirm-reset.component.scss']
})

export class ConfirmResetComponent implements OnInit {

  private baselineName = '';
  public activeScenario? : Scenario;
  public activeArea? : number | undefined;

  constructor(private store: Store<State>,
              private dialog: DialogRef) {}

  confirm = () => {
    // Reset default band selection
    this.store.dispatch(
      MetadataActions.fetchMetadata({ baseline: this.baselineName })
    );

    if(this.activeScenario) {
      if (typeof this.activeArea !== 'number') {
        this.store.dispatch(ScenarioActions.resetActiveScenarioChanges());
      } else {
        this.store.dispatch(ScenarioActions.resetActiveScenarioAreaChanges());
      }
    }

    this.dialog.close();
  }

  close = () => {
    this.dialog.close();
  }

  ngOnInit(): void {
    this.store.select(UserSelectors.selectBaseline)
      .pipe(first()).subscribe(bl => { if(bl) { this.baselineName = bl.name } });

    this.store.select(ScenarioSelectors.selectActiveScenario)
      .pipe(first()).subscribe(s => { this.activeScenario = s });

    this.store.select(ScenarioSelectors.selectActiveScenarioArea)
      .pipe(first()).subscribe(a => { this.activeArea = a });
  }
}
