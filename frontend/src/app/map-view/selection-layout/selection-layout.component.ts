import { Component, Input, NgModuleRef } from '@angular/core';
import { DialogService } from "@shared/dialog/dialog.service";
import { ConfirmResetComponent } from "@src/app/map-view/confirm-reset/confirm-reset.component";

@Component({
  selector: 'app-selection-layout',
  templateUrl: './selection-layout.component.html',
  styleUrls: ['./selection-layout.component.scss']
})
export class SelectionLayoutComponent {
  @Input() title?: string;
  @Input() selectedScenarioName?: string;
  @Input() selectedAreaName?: string;
  @Input() searchLabel?: string;
  @Input() searchValue?: string;
  @Input() searchPlaceholder?: string;
  @Input() onSearch: (value: string) => void = (value: string) => (this.searchValue = value);
  @Input() showResetButton = false;
  @Input() areaTab = false;

  constructor(private dialogService: DialogService,
              private moduleRef: NgModuleRef<any>) {}

  reset() : void {
    this.dialogService.open(ConfirmResetComponent, this.moduleRef, {});
  }
}
