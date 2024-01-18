import { Component, Input, NgModuleRef } from '@angular/core';
import { StatePath, AreaGroup, UserArea } from '@data/area/area.interfaces';
import { DialogService } from "@shared/dialog/dialog.service";
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-area-group',
  templateUrl: './area-group.component.html',
  styleUrls: ['./area-group.component.scss']
})
export class AreaGroupComponent {
  @Input() title?: string;
  @Input() areas: AreaGroup[] | UserArea[] = [];
  @Input() searching = false;
  @Input() selectedAreas?: StatePath[];
  @Input() drawUserArea?: () => void;
  @Input() deleteUserArea?: (areaId: number, areaName: string) => void;
  @Input() renameUserArea?: (userArea: UserArea) => void;
  @Input() selectArea?: (statePath: StatePath[], visible: boolean, groupStatePath: StatePath) => void;
  @Input() updateVisible!: (statePath: StatePath) => void;
  @Input() importArea?: () => void;
  faCloudUpload = faCloudUploadAlt;

  constructor(
    private dialogService: DialogService,
    private moduleRef: NgModuleRef<never>
  ) {}

  // onDrawUserArea() {
  //   if (typeof this.drawUserArea === 'function') {
  //     this.drawUserArea();
  //   }
  // }

  onRenameUserArea = (userArea: UserArea) => () => {
    if (typeof this.renameUserArea === 'function') {
      this.renameUserArea(userArea);
    }
  };

  onDeleteUserArea = (areaId: number, areaName: string) => () => {
    if (typeof this.deleteUserArea === 'function') {
      this.deleteUserArea(areaId, areaName);
    }
  };

  onSelectArea(statePath: StatePath[], visible: boolean, groupStatePath: StatePath) {
    if (typeof this.selectArea === 'function') {
      this.selectArea(statePath, visible, groupStatePath);
    }
  }
}

@Component({
  selector: 'app-edit-area',
  template: `
    <div (mouseleave)="open = false">
      <app-icon-button
        class="edit-icon"
        [attr.data-active]="open"
        icon="edit"
        label="{{ 'map.user-area.edit.label' | translate }}"
        (iconClick)="toggleOpen()"
      ></app-icon-button>
      <ul *ngIf="open" class="edit-options">
        <li (click)="onRenameUserArea($event)"
            tabindex="0">{{ 'map.user-area.rename.label' | translate }}</li>
        <li class="delete" (click)="onDeleteUserArea($event)"
            tabindex="0">
          {{ 'map.user-area.delete.label' | translate }}
        </li>
      </ul>
    </div>
  `,
  styleUrls: ['./area-group.component.scss']
})
export class EditAreaComponent {
  @Input() deleteUserArea?: () => void;
  @Input() renameUserArea?: () => void;
  open = false;

  private onClick(event: Event) {
    event.stopPropagation();
    this.open = false;
  }

  toggleOpen() {
    this.open = !this.open;
  }

  onDeleteUserArea(event: Event) {
    this.onClick(event);
    if (typeof this.deleteUserArea === 'function') {
      this.deleteUserArea();
    }
  }

  onRenameUserArea(event: Event) {
    this.onClick(event);
    if (typeof this.renameUserArea === 'function') {
      this.renameUserArea();
    }
  }
}
