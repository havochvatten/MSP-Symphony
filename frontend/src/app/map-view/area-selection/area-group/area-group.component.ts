import { Component, EventEmitter, Input, NgModuleRef, Output } from '@angular/core';
import { StatePath, AreaGroup, UserArea, Area } from '@data/area/area.interfaces';
import { DialogService } from "@shared/dialog/dialog.service";
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";
import { statePathContains } from "@shared/common.util";
import { MultiModeListable } from "@shared/multi-tools/multi-mode-listable";
import { ListItemsSort } from "@data/common/sorting.interfaces";
import { area } from "d3";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-area-group',
  templateUrl: './area-group.component.html',
  styleUrls: ['./area-group.component.scss']
})
export class AreaGroupComponent extends MultiModeListable {
  @Input() title?: string;
  @Input() areas: AreaGroup[] | UserArea[] = [];
  @Input() searching = false;
  @Input() selectedAreas?: StatePath[];
  @Input() userArea = false;
  @Input() drawUserArea?: () => void;
  @Input() deleteUserArea?: (areaId: number, areaName: string) => void;
  @Input() deleteMultipleUserAreas?: (areaIds: number[]) => void;
  @Input() renameUserArea?: (userArea: UserArea) => void;
  @Input() selectArea?: (statePath: StatePath, visible: boolean,
                         groupStatePath: StatePath, expand: boolean) => void;
  @Input() toggleVisible!: (statePath: StatePath) => void;
  @Input() toggleExpanded?: (statePath: StatePath) => void;
  @Input() importArea?: () => void;
  faCloudUpload = faCloudUploadAlt;

  @Output() highlight: EventEmitter<[StatePath, boolean]> = new EventEmitter();

  constructor(
    protected dialogService: DialogService,
    protected moduleRef: NgModuleRef<never>,
    private translateService: TranslateService
  ) {
    super(moduleRef, dialogService);
  }

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

  deleteSelectedUserAreas = async () => {
    const multi = this.selectedIds.length > 1,
          userAreaName = multi ? '' : this.areas.find(area => area.id === this.selectedIds[0])?.name || '';
    await this.deleteSelected(
      { data: {
          header: this.translateService.instant(
            multi ? 'map.user-area.delete.modal.header-multiple' :
              'map.user-area.delete.modal.header'),
          message: this.translateService.instant(
            multi ? 'map.user-area.delete.modal.message-multiple' :
              'map.user-area.delete.modal.message',
              { count: this.selectedIds.length, userAreaName }),
          confirmText: this.translateService.instant('controls.delete'),
          confirmColor: 'warn',
          buttonsClass: 'no-margin'
        }
      }, this.deleteMultipleUserAreas!.bind(this, this.selectedIds));
  }

  onSelectArea(area: Area, group: AreaGroup, $event: MouseEvent) {
    if(this.isMultiMode()){
      this.multiSelect(parseInt(<string>group.id));
    } else if (typeof this.selectArea === 'function') {
      this.selectArea(area.statePath, group.visible, group.statePath,  $event.ctrlKey);
    }
  }

  highlightArea(statePath: StatePath) {
    this.highlight.emit([statePath, true]);
  }

  clearHighlight(statePath: StatePath) {
    this.highlight.emit([statePath, false]);
  }

  isSelected(statePath: StatePath) {
    return this.selectedAreas && statePathContains(statePath, this.selectedAreas);
  }

  setSort(sortType: ListItemsSort): void {}

  deselectAreas = () => {
    this.selectedIds = [];
  }

  protected readonly area = area;
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
