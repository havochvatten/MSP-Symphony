import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import {
  Component,
  ViewChild,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import { MapComponent } from './map/map.component';
import { MetadataSelectors } from '@data/metadata';
import { AreaSelectors } from '@data/area';
import { Observable, PartialObserver } from 'rxjs';
import { AllAreas, StatePath } from '@data/area/area.interfaces';
import { BandGroup } from '@data/metadata/metadata.interfaces';
import { LegendState } from '@data/calculation/calculation.interfaces';
import { CalculationSelectors } from '@data/calculation';
import { environment } from "@src/environments/environment";
import { ScenarioActions, ScenarioSelectors } from "@data/scenario";
import { Scenario } from "@data/scenario/scenario.interfaces";
import { take } from "rxjs/operators";

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent implements OnInit, AfterViewInit {
  @ViewChild(MapComponent) map: MapComponent | undefined;
  leftSidebarIsOpen = true; // TODO create action, or observable??
  metadata?: Observable<Record<string, BandGroup[]>>;
  areas?: Observable<AllAreas>;
  legends$?: Observable<LegendState>;
  center = environment.map.center;
  visibleImpact = false;
  visibleComparison = false;

  protected activeScenario$: Observable<Scenario | undefined>;
  protected activeScenarioArea$: Observable<number | undefined>;
  protected scenarioAreaSelection = false

  constructor(
    private store: Store<State>,
    private cd: ChangeDetectorRef) {
    this.activeScenario$ = this.store.select(ScenarioSelectors.selectActiveScenario);
    this.activeScenarioArea$ = this.store.select(ScenarioSelectors.selectActiveScenarioArea);
  }

  ngOnInit() {
    this.metadata = this.store.select(MetadataSelectors.selectMetadata);
    this.areas = this.store.select(AreaSelectors.selectAll);
    this.legends$ = this.store.select(CalculationSelectors.selectVisibleLegends);
  }

  clearResult = () => {
    this.map?.clearResult();
  };

  toggleLeftSidebar() {
    this.leftSidebarIsOpen = !this.leftSidebarIsOpen;
  }

  toggleDrawArea = () => {
    this.map?.toggleDrawInteraction();
  }

  zoomToArea = (statePaths: StatePath[]) => {
    this.map?.zoomToArea(statePaths);
  }

  ngAfterViewInit(): void {
      this.cd.detectChanges(); // To avoid ExpressionChangedAfterItHasBeenCheckedError
  }

  exitScenario() {
    this.activeScenarioArea$.pipe(take(1)).subscribe((areaIndex) => {
      if(areaIndex !== undefined){
        this.store.dispatch(ScenarioActions.closeActiveScenarioArea());
      } else {
        this.store.dispatch(ScenarioActions.closeActiveScenario());
      }
    });
  }

  onNavigate(tabId: string) {
    this.scenarioAreaSelection = tabId === 'scenario';
  }

  getVisibleImpact(): boolean {
    return this.visibleImpact;
  }

  getVisibleComparison() {
    return this.visibleComparison;
  }

  setVisibleImpact(value: number) {
    this.visibleImpact = value > 0;
  }

  setVisibleComparison(value: number) {
    this.visibleComparison = value > 0;
  }
}
