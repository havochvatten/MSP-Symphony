import { ChangeDetectorRef, Component, inject, NgModuleRef, ViewChild } from '@angular/core';
import { MetadataSelectors } from '@data/metadata';
import { BandGroup, VisibleReliability } from '@data/metadata/metadata.interfaces';
import { Store } from '@ngrx/store';
import { MapViewModule } from '@src/app/map-view/map-view.module';
import { MapComponent } from '@src/app/map-view/map/map.component';
import { DialogService } from '@src/app/shared/dialog/dialog.service';
import { environment } from '@src/environments/environment';
import { isMacOS } from '@src/util/agent';
import { State } from '@src/app/app-reducer';
import { Observable } from 'rxjs';
import { LegendState } from '@data/calculation/calculation.interfaces';
import { CalculationSelectors } from '@data/calculation';
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
  legends$?: Observable<LegendState>;
  center = environment.map.center;
  visibleImpact = false;
  isMacOS = isMacOS();
  visibleReliability$: Observable<VisibleReliability | null>;

  constructor() {
    this.store.dispatch(UserActions.createPublicUser());
    this.visibleReliability$ = this.store.select(MetadataSelectors.selectVisibleReliability);
  }

  ngOnInit() {
    this.metadata = this.store.select(MetadataSelectors.selectMetadata);
    this.legends$ = this.store.select(CalculationSelectors.selectVisibleLegends);
  }

  toggleLeftSidebar() {
    this.leftSidebarIsOpen = !this.leftSidebarIsOpen;
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges(); // To avoid ExpressionChangedAfterItHasBeenCheckedError
  }

  onOpenCCList() {
    this.dialogService.open(CompoundComparisonListDialogComponent, this.moduleRef);
  }

  getVisibleImpact(): boolean {
    return this.visibleImpact;
  }

  setVisibleImpact(value: number) {
    this.visibleImpact = value > 0;
  }
}
