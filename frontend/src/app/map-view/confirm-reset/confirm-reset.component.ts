import { Component, OnInit } from '@angular/core';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { Store } from "@ngrx/store";
import { UserSelectors } from "@data/user";
import { State } from "@src/app/app-reducer";
import { MetadataActions } from "@data/metadata";
import { ScenarioActions, ScenarioSelectors } from "@data/scenario";
import { first } from "rxjs/operators";
import { Scenario } from "@data/scenario/scenario.interfaces";
import { BandChange } from "@data/metadata/metadata.interfaces";

@Component({
  selector: 'app-confirm-reset',
  templateUrl: './confirm-reset.component.html',
  styleUrls: ['./confirm-reset.component.scss']
})

export class ConfirmResetComponent implements OnInit {

  private baselineName = '';
  public activeScenario? : Scenario;

  constructor(private store: Store<State>,
              private dialog: DialogRef) {}

  confirm = () => {
    // Reset default band selection
    this.store.dispatch(
      MetadataActions.fetchMetadata({ baseline: this.baselineName })
    );

    if(this.activeScenario){
      // Reset multipliers for active scenario (to zero)
      this.store
        .select(ScenarioSelectors.selectActiveScenarioChangeFeatures)
        .pipe(first())
        .subscribe(features => {
          if(features) {
            Object.values(features).map((f, fx) => {
              const changes = Object.entries<BandChange>(f.properties?.changes);
              if (changes.length > 1) {
                (changes.reverse()).forEach(
                  ([bId,]) => {
                    this.store.dispatch(ScenarioActions.deleteBandChangeOrChangeFeature({
                      featureIndex: fx,
                      bandId: bId
                    }));
                  });
              } else if (changes.length === 1) {
                this.store.dispatch(ScenarioActions.deleteBandChangeOrChangeFeature({
                  featureIndex: fx,
                  bandId: changes[0][0]
                }));
              }
            });
          }
        });
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
  }
}
