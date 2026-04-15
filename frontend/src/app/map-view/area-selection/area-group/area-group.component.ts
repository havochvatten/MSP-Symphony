import { Component, EventEmitter, Input, NgModuleRef, Output } from '@angular/core';
import { StatePath, AreaGroup, UserArea, Area, UserAreaCategoryState } from '@data/area/area.interfaces';
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
  @Input() areas: AreaGroup[] | UserAreaCategoryState[] = [];
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
  @Input() deleteUserAreaCategory?: (categoryId: number) => void;
  @Input() renameUserAreaCategory?: (categoryId: number, currentName: string) => void;
  @Input() renameCategory?: (categoryId: number) => void;
  @Input() moveUserArea?: (userArea: UserArea) => void;
  faCloudUpload = faCloudUploadAlt;

  @Output() highlight: EventEmitter<[StatePath, boolean]> = new EventEmitter();

  constructor(
    protected dialogService: DialogService,
    protected moduleRef: NgModuleRef<never>,
    private translateService: TranslateService
  ) {
    super(moduleRef, dialogService);
  }

  getAreas(group: any): UserArea[] {
    const areas = Array.isArray(group.areas)
      ? group.areas
      : Object.values(group.areas);
    console.log('first area polygon:', areas[0]?.polygon);
    return areas;
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

  onRenameUserAreaCategory = (categoryId: number, currentName: string) => () => {
    if (typeof this.renameUserAreaCategory === 'function') {
      this.renameUserAreaCategory(categoryId, currentName);
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

  onDeleteUserAreaCategory = (categoryId: number) => () => {
    if (typeof this.deleteUserAreaCategory === 'function') {
      this.deleteUserAreaCategory(categoryId);
    }
  };

  onMoveUserArea = (userArea: UserArea) => () => {
    if (typeof this.moveUserArea === 'function') {
      this.moveUserArea(userArea);
    }
  };

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
        <li (click)="onMoveArea($event)" *ngIf="moveArea" tabindex="0">
          {{ 'map.user-area.move.label' | translate }}
        </li>
        <li (click)="onRenameUserArea($event)" *ngIf="renameUserArea"
            tabindex="0">{{ 'map.user-area.rename.label' | translate }}
        </li>
        <li (click)="onRenameCategory($event)" *ngIf="renameCategory" tabindex="0">
          {{ 'map.user-area.rename-category.label' | translate }}
        </li>
        <li class="delete" (click)="onDeleteUserArea($event)" *ngIf="deleteUserArea"
            tabindex="0">
          {{ 'map.user-area.delete.label' | translate }}
        </li>
        <li class="delete" (click)="onDeleteCategory($event)" *ngIf="deleteCategory" tabindex="0">
          {{ 'map.user-area.delete-category.label' | translate }}
        </li>
      </ul>
    </div>
  `,
  styleUrls: ['./area-group.component.scss']
})
export class EditAreaComponent {
  @Input() deleteUserArea?: () => void;
  @Input() renameUserArea?: () => void;
  @Input() deleteCategory?: () => void;
  @Input() renameCategory?: () => void;
  @Input() moveArea?: () => void;
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

  onRenameCategory(event: Event) {
    this.onClick(event);
    if (typeof this.renameCategory === 'function') {
      this.renameCategory();
    }
  }

  onDeleteCategory(event: Event) {
    this.onClick(event);
    if (typeof this.deleteCategory === 'function') {
      this.deleteCategory();
    }
  }

  onMoveArea(event: Event) {
    this.onClick(event);
    if (typeof this.moveArea === 'function') {
      this.moveArea();
    }
  }
}

