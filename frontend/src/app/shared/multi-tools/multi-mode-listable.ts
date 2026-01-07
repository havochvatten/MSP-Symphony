import { Listable } from "@shared/list-filter/listable.directive";
import { inject, NgModule, NgModuleRef, signal } from "@angular/core";
import { DialogService } from "@shared/dialog/dialog.service";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { ConfirmationModalComponent } from "@shared/confirmation-modal/confirmation-modal.component";

export abstract class MultiModeListable extends Listable {
  protected dialogService = inject(DialogService);
  protected readonly moduleRef = inject(NgModuleRef<NgModule>);

  protected constructor() {
    super();
  }

selectedIds: number[] = [];
isMultiMode = signal<boolean>(false);

deleteSelected = async (dialogConfig: DialogConfig, confirmDelegate: () => void) => {
const deletionConfirmed = await this.dialogService.open(ConfirmationModalComponent, this.moduleRef, dialogConfig);
if (deletionConfirmed) {
  confirmDelegate();
  this.selectedIds = [];
  this.isMultiMode.set(false);
}
}

noneSelected = () => { return !(this.isMultiMode() && this.selectedIds.length > 0) };

async multiSelect(id: number) {
if(!this.selectedIds.includes(id)) {
  this.selectedIds.push(id);
} else {
  this.selectedIds = this.selectedIds.filter(i => i !== id);
}
}
}
