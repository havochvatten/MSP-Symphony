import { Component, Input, NgModuleRef, inject } from '@angular/core';
import { UserSelectors } from '@data/user';
import { Store } from '@ngrx/store';
import { DialogService } from '@shared/dialog/dialog.service';
import { ConfirmResetComponent } from '@src/app/map-view/confirm-reset/confirm-reset.component';
import { MapViewModule } from '@src/app/map-view/map-view.module';
import { State } from 'ol/render';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-selection-layout',
  templateUrl: './selection-layout.component.html',
  styleUrls: ['./selection-layout.component.scss'],
  standalone: false
})
export class SelectionLayoutComponent {
  private readonly dialogService = inject(DialogService);
  private readonly moduleRef = inject(NgModuleRef<MapViewModule>);
  private readonly store = inject<Store<State>>(Store);

  @Input() title?: string;
  @Input() selectedScenarioName?: string;
  @Input() selectedAreaName?: string;
  @Input() searchLabel?: string;
  @Input() searchValue?: string;
  @Input() searchPlaceholder?: string;
  @Input() onSearch: (value: string) => void = (value: string) => (this.searchValue = value);
  @Input() showResetButton = false;
  @Input() areaTab = false;

  private isLoggedIn$: Observable<boolean>;

  constructor() {
    this.isLoggedIn$ = this.store.select(UserSelectors.selectIsLoggedIn);
  }
  reset(): void {
    this.dialogService.open(ConfirmResetComponent, this.moduleRef, {});
  }
}
