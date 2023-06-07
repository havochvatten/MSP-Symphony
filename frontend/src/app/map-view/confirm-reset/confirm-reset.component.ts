import { Component, OnInit } from '@angular/core';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { Store } from "@ngrx/store";
import { UserSelectors } from "@data/user";
import { State } from "@src/app/app-reducer";
import { MetadataActions } from "@data/metadata";
import { ScenarioActions, ScenarioSelectors } from "@data/scenario";
import { first } from "rxjs/operators";
import { Scenario, ScenarioArea } from "@data/scenario/scenario.interfaces";
import { BandChange } from "@data/metadata/metadata.interfaces";

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

    if(this.activeScenario){
      if(typeof this.activeArea !== 'number') {
        // Reset multipliers for active scenario (to zero)
        this.store
          .select(ScenarioSelectors.selectActiveScenarioChanges)
          .pipe(first())
          .subscribe(changes => {
            if (changes) {
              const changes_iter = Object.entries<BandChange>(changes);
              if (changes_iter.length > 1) {
                (changes_iter.reverse()).forEach(
                  ([bId,]) => {
                    this.store.dispatch(ScenarioActions.deleteBandChange({
                      bandId: bId
                    }));
                  });
              } else if (changes_iter.length === 1) {
                this.store.dispatch(ScenarioActions.deleteBandChange({
                  bandId: changes_iter[0][0]
                }));
              }
            }
          });
      } else {
        // Reset multipliers for active scenario area (to zero)
        this.store
          .select(ScenarioSelectors.selectActiveScenarioAreaChanges)
          .pipe(first())
          .subscribe(changes => {
            if (changes) {
              const changes_iter = Object.entries<BandChange>(changes);
              if (changes_iter.length > 1) {
                (changes_iter.reverse()).forEach(
                  ([bId,]) => {
                    this.store.dispatch(ScenarioActions.deleteAreaBandChange({
                      bandId: bId
                    }));
                  });
              } else if (changes_iter.length === 1) {
                this.store.dispatch(ScenarioActions.deleteAreaBandChange({
                  bandId: changes_iter[0][0]
                }));
              }
            }
          });
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
