import { Component, Input, NgModuleRef, OnDestroy, OnInit } from '@angular/core';
import { Band, StatePath } from '@data/metadata/metadata.interfaces';
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";
import { ScenarioSelectors } from "@data/scenario";
import { ChangesProperty, Scenario } from "@data/scenario/scenario.interfaces";
import { Subscription } from "rxjs";
import { SelectableArea } from "@data/area/area.interfaces";
import { selectActiveScenario } from "@data/scenario/scenario.selectors";
import { DialogService } from "@shared/dialog/dialog.service";
import { MetaInfoComponent } from "@src/app/map-view/meta-info/meta-info.component";

@Component({
  selector: 'app-slider-controls',
  templateUrl: './slider-controls.component.html',
  styleUrls: ['./slider-controls.component.scss']
})
export class SliderControlsComponent implements OnDestroy, OnInit {
  open = false;

  scenario?: Scenario;
  multiplier?: number;
  offset?: number;

  public hasPublicMeta = false;

  private scenarioSubscription$: Subscription;
  private changesSubscription$: Subscription;

  @Input() band!: Band;
  @Input() selectedArea?: SelectableArea = undefined;
  @Input() onSelect = (checked: boolean, statePath: StatePath) => {}
  @Input() onChangeVisible: (value: boolean, statePath: StatePath) => void = () => {};

  constructor(
    private store: Store<State>,
    private dialogService: DialogService,
    private moduleRef: NgModuleRef<any>
  ) {

    this.scenarioSubscription$ = this.store.select(selectActiveScenario)
      .subscribe(s => {
        if (s === undefined)
          this.open = false;

        this.scenario = s;
      });

    this.changesSubscription$ = this.store.select(ScenarioSelectors.selectActiveScenarioFeatureChanges)
      .subscribe((changes: ChangesProperty) => {
        if (this.band && Object.keys(changes).length>0) {
          if (this.band.title in changes) {
            this.multiplier = changes[this.band!.title]?.multiplier;
            this.offset = changes[this.band!.title]?.offset;
            this.open = true;
          }
        } else {
          this.multiplier = this.offset = undefined;
          this.open = false;
        }
      });
  }

  ngOnInit(): void {
    const publicMeta =
      [ this.band.methodSummary,
        this.band.limitationsForSymphony,
        this.band.valueRange,
        this.band.dataProcessing ];

    for (const meta of publicMeta) {
      if (meta) {
        this.hasPublicMeta = true;
        break;
      }
    }
  }

  toggleOpen() {
    this.open = !this.open;
  }

  ngOnDestroy() {
    this.changesSubscription$?.unsubscribe();
    this.scenarioSubscription$?.unsubscribe();
  }

  showMetaDialog() {
    this.dialogService.open(MetaInfoComponent, this.moduleRef, { data: { band: this.band } });
  }
}
