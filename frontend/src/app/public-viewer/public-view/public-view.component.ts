import { ChangeDetectorRef, Component, inject, NgModuleRef, ViewChild } from '@angular/core';
import { AllAreas, StatePath } from '@data/area/area.interfaces';
import { MetadataSelectors } from '@data/metadata';
import { BandGroup, VisibleReliability } from '@data/metadata/metadata.interfaces';
import { Store } from '@ngrx/store';
import { MapViewModule } from '@src/app/map-view/map-view.module';
import { MapComponent } from '@src/app/map-view/map/map.component';
import { DialogService } from '@src/app/shared/dialog/dialog.service';
import { environment } from '@src/environments/environment';
import { isMacOS } from '@src/util/agent';
import { State } from '@src/app/app-reducer';
import { distinctUntilChanged, Observable, skip, Subscription, take } from 'rxjs';
import { LegendState, ComparisonLegendState } from '@data/calculation/calculation.interfaces';
import { CalculationSelectors } from '@data/calculation';
import { AreaSelectors } from '@data/area';
import { ScenarioSelectors, ScenarioActions } from '@data/scenario';
import { Scenario } from '@data/scenario/scenario.interfaces';
import { CompoundComparisonListDialogComponent } from '@src/app/map-view/compound-comparison-list-dialog/compound-comparison-list-dialog.component';
import { UserActions } from '@data/user';

@Component({
  selector: 'app-public-view',
  templateUrl: './public-view.component.html',
  styleUrl: './public-view.component.scss',
  standalone: false
})
export class PublicView {
  private readonly store = inject<Store<State>>(Store);
  private readonly cd = inject(ChangeDetectorRef);
  private readonly dialogService = inject(DialogService);
  private readonly moduleRef = inject(NgModuleRef<MapViewModule>);

  @ViewChild(MapComponent) map: MapComponent | undefined;
  leftSidebarIsOpen = true; // TODO create action, or observable??
  metadata?: Observable<Record<string, BandGroup[]>>;
  areas?: Observable<AllAreas>;
  legends$?: Observable<LegendState>;
  cmpLegends$?: Observable<ComparisonLegendState[]>;
  compoundComparisonCount$: Observable<number> = this.store.select(
    CalculationSelectors.selectCompoundComparisonCount
  );
  compoundComparisonSuccess$: Observable<number> = this.store.select(
    CalculationSelectors.selectCompoundComparisonSuccessCount
  );
  center = environment.map.center;
  visibleImpact = false;
  visibleComparison = false;
  singleSelection = false;
  multiSelection = false;
  isMacOS = isMacOS();
  visibleReliability$: Observable<VisibleReliability | null>;

  protected activeScenario$: Observable<Scenario | undefined> = this.store.select(
    ScenarioSelectors.selectActiveScenario
  );
  protected activeScenarioArea$: Observable<number | undefined> = this.store.select(
    ScenarioSelectors.selectActiveScenarioArea
  );
  protected calculating$: Observable<boolean> = this.store.select(
    CalculationSelectors.selectCalculating
  );
  protected scenarioAreaSelection = false;
  private selectedAreas$?: Subscription;

  constructor() {
    this.store.dispatch(UserActions.createPublicUser());
    this.compoundComparisonSuccess$
      .pipe(distinctUntilChanged(), skip(1))
      .subscribe(() => this.onOpenCCList());

    this.visibleReliability$ = this.store.select(MetadataSelectors.selectVisibleReliability);
  }

  ngOnInit() {
    this.metadata = this.store.select(MetadataSelectors.selectMetadata);
    this.areas = this.store.select(AreaSelectors.selectAll);
    this.legends$ = this.store.select(CalculationSelectors.selectVisibleLegends);
    this.cmpLegends$ = this.store.select(CalculationSelectors.selectComparisonLegend);
    this.selectedAreas$ = this.store
      .select(AreaSelectors.selectSelectedAreaData)
      .subscribe((areas) => {
        this.singleSelection = areas.length === 1;
        this.multiSelection = areas.length > 1;
      });
  }

  clearResult = () => {
    this.map?.clearResult();
  };

  highlight = ([statePath, highlight]: [StatePath, boolean]) => {
    this.map?.highlightArea(statePath, highlight);
  };

  toggleLeftSidebar() {
    this.leftSidebarIsOpen = !this.leftSidebarIsOpen;
  }

  zoomToArea = (statePaths: StatePath[]) => {
    this.map?.zoomToArea(statePaths);
  };

  ngAfterViewInit(): void {
    this.cd.detectChanges(); // To avoid ExpressionChangedAfterItHasBeenCheckedError
  }

  exitScenario() {
    this.activeScenarioArea$.pipe(take(1)).subscribe((areaIndex) => {
      if (areaIndex !== undefined) {
        this.store.dispatch(ScenarioActions.closeActiveScenarioArea());
      } else {
        this.store.dispatch(ScenarioActions.closeActiveScenario());
      }
    });
  }

  onNavigate(tabId: string) {
    this.scenarioAreaSelection = tabId === 'scenario' || tabId === 'areas';
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
