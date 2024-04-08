import { Component, Input, NgModuleRef, OnDestroy, OnInit } from '@angular/core';
import { Band, BandChange, BandType } from '@data/metadata/metadata.interfaces';
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";
import { ScenarioSelectors } from "@data/scenario";
import { ChangesProperty, Scenario } from "@data/scenario/scenario.interfaces";
import { Subscription } from "rxjs";
import { selectActiveScenario } from "@data/scenario/scenario.selectors";
import { DialogService } from "@shared/dialog/dialog.service";
import { MetaInfoComponent } from "@src/app/map-view/meta-info/meta-info.component";
import { isEmpty } from "@shared/common.util";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { environment as env } from "@src/environments/environment";

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
  private overrideChangesSubscription$: Subscription;
  private scenarioAreaSubscription$: Subscription;

  protected change?: BandChange;
  protected overriddenChange?: BandChange;

  private groupSetting = false;

  @Input() band!: Band;
  @Input() category!: BandType; // unfortunate "property drilling"

  @Input() disabled = false;
  @Input() onSelect!: (event: MatCheckboxChange, band: Band)=> void;
  @Input() onChangeVisible!: (value: boolean, band: Band) => void;

  isEmpty = isEmpty;

  constructor(
    private store: Store<State>,
    private dialogService: DialogService,
    private moduleRef: NgModuleRef<never>
  ) {
    this.scenarioSubscription$ = this.store.select(selectActiveScenario)
      .subscribe(s => {
        if (s === undefined)
          this.open = false;

        this.scenario = s;
      });

    this.scenarioAreaSubscription$ = this.store.select(ScenarioSelectors.selectActiveScenarioArea).subscribe(area => {
      this.groupSetting = area === undefined;
    });

    this.changesSubscription$ = this.store.select(ScenarioSelectors.selectActiveScenarioChanges)
      .subscribe((changes: {[bandType: string] : ChangesProperty }) => {
        if (this.band && changes[this.category] && Object.keys(changes[this.category]).length>0) {
          if (this.band.bandNumber in changes[this.category]) {
            this.change = changes[this.category][this.band!.bandNumber];
            this.open = true;
            return;
          }
        }
        this.change = undefined;
      });

    this.overrideChangesSubscription$ = this.store.select(ScenarioSelectors.selectActiveScenarioAreaChanges)
      .subscribe((changes: {[bandType: string] : ChangesProperty }) => {
        if (this.band && changes[this.category] && Object.keys(changes[this.category]).length>0) {
          if (this.band.bandNumber in changes[this.category]) {
            this.overriddenChange = changes[this.category][this.band!.bandNumber];
            this.open = true;
            return;
          }
        }
        this.overriddenChange = undefined;
      });
  }

  ngOnInit(): void {
    this.hasPublicMeta = env.meta.visible_fields.some(
      visible_field => !!this.band?.meta && !!this.band.meta[visible_field]
    )
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

  getGroupSetting() {
    return this.groupSetting;
  }

  getMultiplier() : number {
    const groupMultiplier = this.change?.multiplier ?? 1,
      overriddenMultiplier = this.overriddenChange?.multiplier ?? 1;

    return this.groupSetting || !this.overriddenChange ? groupMultiplier : overriddenMultiplier;
  }

  getOffset() : number {
    const groupOffset = this.change?.offset ?? 0,
        overriddenOffset = this.overriddenChange?.offset ?? 0;

    return this.groupSetting || !this.overriddenChange ? groupOffset : overriddenOffset;
  }
}
