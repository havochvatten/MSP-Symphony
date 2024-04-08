import {
  Component, ViewChild, OnInit,
  AfterViewInit, ChangeDetectorRef, Signal, signal, NgModuleRef
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, skip, take } from "rxjs/operators";

import { State } from '@src/app/app-reducer';
import { MetadataSelectors } from '@data/metadata';
import { AreaSelectors } from '@data/area';
import { AllAreas, StatePath } from '@data/area/area.interfaces';
import { BandGroup } from '@data/metadata/metadata.interfaces';
import { ComparisonLegendState, LegendState } from '@data/calculation/calculation.interfaces';
import { CalculationSelectors } from '@data/calculation';
import { environment } from "@src/environments/environment";
import { ScenarioActions, ScenarioSelectors } from "@data/scenario";
import { Scenario } from "@data/scenario/scenario.interfaces";
import { MapComponent } from './map/map.component';
import { isMacOS } from '@src/util/agent';
import {
  CompoundComparisonListDialogComponent
} from "@src/app/map-view/compound-comparison-list-dialog/compound-comparison-list-dialog.component";
import { DialogService } from "@shared/dialog/dialog.service";

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
  cmpLegends$?: Observable<ComparisonLegendState[]>;
  compoundComparisonCount$: Observable<number>
    = this.store.select(CalculationSelectors.selectCompoundComparisonCount);
  compoundComparisonSuccess$: Observable<number>
    = this.store.select(CalculationSelectors.selectCompoundComparisonSuccessCount);
  center = environment.map.center;
  visibleImpact = false;
  visibleComparison = false;
  singleSelection = false
  multiSelection = false
  isMacOS = isMacOS();

  protected activeScenario$: Observable<Scenario | undefined>
    = this.store.select(ScenarioSelectors.selectActiveScenario);
  protected activeScenarioArea$: Observable<number | undefined>
    = this.store.select(ScenarioSelectors.selectActiveScenarioArea);
  protected calculating$: Observable<boolean>
    = this.store.select(CalculationSelectors.selectCalculating);
  protected scenarioAreaSelection = false
  private selectedAreas$?: Subscription;

  constructor(
    private store: Store<State>,
    private cd: ChangeDetectorRef,
    private moduleRef: NgModuleRef<never>,
    private dialogService: DialogService) {

    this.compoundComparisonSuccess$.pipe(
      distinctUntilChanged(), skip(1)).subscribe(() => this.onOpenCCList());
  }

  ngOnInit() {
    this.metadata = this.store.select(MetadataSelectors.selectMetadata);
    this.areas = this.store.select(AreaSelectors.selectAll);
    this.legends$ = this.store.select(CalculationSelectors.selectVisibleLegends);
    this.cmpLegends$ = this.store.select(CalculationSelectors.selectComparisonLegend);
    this.selectedAreas$ = this.store.select(AreaSelectors.selectSelectedAreaData).subscribe((areas) => {
      this.singleSelection = areas.length === 1;
      this.multiSelection = areas.length > 1;
    });
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

  onOpenCCList() {
    this.dialogService.open(CompoundComparisonListDialogComponent, this.moduleRef);
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
