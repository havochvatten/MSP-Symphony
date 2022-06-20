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
import { Observable } from 'rxjs';
import { AllAreas, StatePath } from '@data/area/area.interfaces';
import { BandGroup } from '@data/metadata/metadata.interfaces';
import { LegendState } from '@data/calculation/calculation.interfaces';
import { CalculationSelectors } from '@data/calculation';

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

  constructor(private store: Store<State>, private cd: ChangeDetectorRef) {}

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

  zoomToArea = (statePath: StatePath) => {
    this.map?.zoomToArea(statePath);
  }

  ngAfterViewInit(): void {
      this.cd.detectChanges(); // To avoid ExpressionChangedAfterItHasBeenCheckedError
  }
}
