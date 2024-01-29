import { Component, Input, OnDestroy } from '@angular/core';
import { AreaSelectors } from "@data/area";
import { Area } from "@data/area/area.interfaces";
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";
import { Baseline } from "@data/user/user.interfaces";
import { TranslateService } from "@ngx-translate/core";
import { MetadataSelectors } from "@data/metadata";
import { Band } from "@data/metadata/metadata.interfaces";
import { ScenarioService } from "@data/scenario/scenario.service";
import { UserSelectors } from "@data/user";
import { Subscription } from "rxjs";
import { Scenario } from "@data/scenario/scenario.interfaces";
import { GeoJSON } from "ol/format";

@Component({
  selector: 'app-add-scenario-areas',
  templateUrl: './add-scenario-areas.component.html',
  styleUrls: ['./add-scenario-areas.component.scss']
})
export class AddScenarioAreasComponent implements OnDestroy {
  public selectedAreas: Area[] = [];
  baseline?: Baseline; // required in delegate context

  @Input() clickDelegate?: (a: Area[], c: AddScenarioAreasComponent) => void;
  @Input() noneSelectedTipKey!: string;
  @Input() singleSelectedTipKey!: string;
  @Input() multipleSelectedTipKey!: string;
  @Input() selectionOverlap = false;
  @Input() scenario?: Scenario;
  @Input() disabled = false;

  format: GeoJSON;

  public selectedComponents?: { ecoComponent: Band[], pressureComponent: Band[] };
  private areaSubscription$: Subscription;
  private componentSubscription$: Subscription;

  constructor(
    public store: Store<State>,
    public translateService: TranslateService,
    public scenarioService: ScenarioService
  ) {
    this.areaSubscription$ = this.store
      .select(AreaSelectors.selectSelectedAreaData)
      .subscribe(area => (this.selectedAreas = area as Area[]));
    this.componentSubscription$ = this.store
      .select(MetadataSelectors.selectSelectedComponents)
      .subscribe(components => (this.selectedComponents = components));
    this.store
      .select(UserSelectors.selectBaseline)
      .subscribe(baseline => (this.baseline = baseline));
    this.format = new GeoJSON();
  }

  callDelegate() {
    if(this.clickDelegate && !(this.disabled || this.selectedAreas.length === 0 || this.selectionOverlap)) {
      this.clickDelegate(this.selectedAreas, this);
    }
  }

  ngOnDestroy() {
    this.areaSubscription$.unsubscribe();
    this.componentSubscription$.unsubscribe();
  }
}
