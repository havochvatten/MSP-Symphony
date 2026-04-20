import { Component, OnInit, inject } from '@angular/core';
import { Store } from "@ngrx/store";
import { first } from "rxjs/operators";
import { State } from "@src/app/app-reducer";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { MetadataActions } from "@data/metadata";
import { ScenarioActions, ScenarioSelectors } from "@data/scenario";
import { Scenario } from "@data/scenario/scenario.interfaces";

@Component({
  selector: 'app-confirm-reset',
  templateUrl: './confirm-reset.component.html',
  styleUrls: ['./confirm-reset.component.scss'],
  standalone: false
})

export class ConfirmResetComponent implements OnInit {
  private store = inject<Store<State>>(Store);
  private dialog = inject(DialogRef);


  public activeScenario? : Scenario;
  public activeArea? : number | undefined;

  confirm = () => {
    // Reset default band selection
    this.store.dispatch(
      MetadataActions.fetchMetadata()
    );
    this.store.dispatch(MetadataActions.setHeatmapModel({ bandType: 'ECOSYSTEM', model: 'none' }));
    this.store.dispatch(MetadataActions.setHeatmapModel({ bandType: 'PRESSURE', model: 'none' }));

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
    this.store.select(ScenarioSelectors.selectActiveScenario)
      .pipe(first()).subscribe(s => { this.activeScenario = s });

    this.store.select(ScenarioSelectors.selectActiveScenarioArea)
      .pipe(first()).subscribe(a => { this.activeArea = a });
  }
}
