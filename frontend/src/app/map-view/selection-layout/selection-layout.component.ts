import { Component, Input, NgModuleRef, inject } from '@angular/core';
import { DialogService } from "@shared/dialog/dialog.service";
import { ConfirmResetComponent } from "@src/app/map-view/confirm-reset/confirm-reset.component";
import { MapViewModule } from "@src/app/map-view/map-view.module";

@Component({
  selector: 'app-selection-layout',
  templateUrl: './selection-layout.component.html',
  styleUrls: ['./selection-layout.component.scss'],
  standalone: false
})
export class SelectionLayoutComponent {
  private readonly dialogService = inject(DialogService);
  private readonly moduleRef = inject(NgModuleRef<MapViewModule>);

  @Input() title?: string;
  @Input() selectedScenarioName?: string;
  @Input() selectedAreaName?: string;
  @Input() searchLabel?: string;
  @Input() searchValue?: string;
  @Input() searchPlaceholder?: string;
  @Input() onSearch: (value: string) => void = (value: string) => (this.searchValue = value);
  @Input() showResetButton = false;
  @Input() areaTab = false;

  reset() : void {
    this.dialogService.open(ConfirmResetComponent, this.moduleRef, {});
  }
}
