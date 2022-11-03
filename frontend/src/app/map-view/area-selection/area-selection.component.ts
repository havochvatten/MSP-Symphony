import { Component, Input, OnChanges, NgModuleRef } from '@angular/core';
import {
  AllAreas,
  NationalArea,
  StatePath,
  UserArea,
  AreaGroup,
  Area
} from '@data/area/area.interfaces';
import { filterNationalAreas, filterUserAreas } from './area-selection.util';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { AreaActions, AreaSelectors } from '@data/area';
import { DialogService } from '@src/app/shared/dialog/dialog.service';
import { RenameUserAreaModalComponent } from './rename-user-area-modal/rename-user-area-modal.component';
import { DeleteUserAreaConfirmationDialogComponent } from './delete-user-area-confirmation-dialog/delete-user-area-confirmation-dialog.component';
import { Observable } from 'rxjs';
import {
  UploadUserAreaModalComponent
} from "@src/app/map-view/map/upload-user-area-modal/upload-user-area-modal.component";
import { MessageActions } from "@data/message";
import * as uuid from "uuid/v4";
import { createFeature } from "@data/area/area.effects";

@Component({
  selector: 'app-area-selection',
  templateUrl: './area-selection.component.html',
  styleUrls: ['./area-selection.component.scss']
})
export class AreaSelectionComponent implements OnChanges {
  @Input() areas?: AllAreas;
  search = '';
  matchingResults = 0;
  selectedArea$?: Observable<StatePath | undefined>
  private nationalAreas: NationalArea[] = [];
  private userAreas: UserArea[] = [];
  filteredNationalAreas: NationalArea[] = [];
  filteredUserAreas: UserArea[] = [];
  @Input() drawUserArea: () => void = () => {};
  @Input() zoomToArea: (statePath: StatePath) => void = () => {};

  constructor(
    private store: Store<State>,
    private dialogService: DialogService,
    private moduleRef: NgModuleRef<any>
  ) {
    this.selectedArea$ = this.store.select(AreaSelectors.selectSelectedArea);
  }

  ngOnChanges() {
    if (this.areas) {
      this.nationalAreas = this.areas.nationalAreas;
      this.userAreas = this.areas.userArea;
    }
    this.filterAreas();
  }

  toggleVisibleArea = (statePath: StatePath) => {
    this.store.dispatch(AreaActions.toggleVisibleArea({ statePath }));
  };

  onSearch = (value: string) => {
    if (typeof value === 'string') {
      this.search = value;
      this.filterAreas();
    }
  };

  selectArea = (statePath: StatePath, visible: boolean, groupStatePath: StatePath) => {
    if (!visible) {
      this.toggleVisibleArea(groupStatePath);
    }
    this.store.dispatch(AreaActions.updateSelectedArea({ statePath }));
    this.zoomToArea(statePath); // listen for this in map instead?
  }

  renameUserArea = async (userArea: UserArea) => {
    const areaName = await this.dialogService.open(RenameUserAreaModalComponent, this.moduleRef, {
      data: { areaName: userArea.name }
    });
    if (typeof areaName === 'string' && areaName !== userArea.name) {
      const updatedArea = {
        id: userArea.id as number,
        name: areaName,
        polygon: userArea.polygon,
        description: ''
      };
      this.store.dispatch(AreaActions.updateUserDefinedArea(updatedArea));
    }
  };

  deleteUserArea = async (userAreaId: number, userAreaName: string) => {
    const deleteArea = await this.dialogService.open(DeleteUserAreaConfirmationDialogComponent, this.moduleRef, {
      data: { areaName: userAreaName }
    });
    if (typeof deleteArea === 'boolean' && deleteArea) {
      this.store.dispatch(AreaActions.deleteUserDefinedArea({ userAreaId }));
    }
  };

  importUserArea = async () => {
    const result = await this.dialogService.open(UploadUserAreaModalComponent, this.moduleRef, {
      data: { mimeType: "application/geopackage+sqlite3" }
    });

    if (result) {
      const importedArea = result as UserArea;
      const statePath = ['userArea', importedArea.id as number];
      this.store.dispatch(AreaActions.createUserDefinedAreaSuccess({ userArea: {
        ...importedArea,
        visible: true,
        displayName: importedArea.name,
        statePath,
        feature: createFeature(importedArea.name, importedArea.name, importedArea.name,
          statePath, importedArea.polygon)
        } }));
      this.store.dispatch(MessageActions.addPopupMessage({
        message: {
          type: 'SUCCESS',
          title: 'Import successful',
          message: `Import of area ${importedArea.name} successful.`,
          uuid: uuid()
        }
      }));
      // TODO Zoom area?
    }
    else
      ; // user cancelled modal
    // toggle visibily of area?
  }


  private filterAreas() {
    this.filteredNationalAreas = filterNationalAreas(this.nationalAreas, this.search);
    this.filteredUserAreas = filterUserAreas(this.userAreas, this.search);
    this.matchingResults =
      this.filteredNationalAreas
        .reduce((groups: AreaGroup[], nationalArea) => [...groups, ...nationalArea.groups], [])
        .reduce((areas: Area[], group) => [...areas, ...group.areas], []).length +
      this.filteredUserAreas.length;
  }
}
