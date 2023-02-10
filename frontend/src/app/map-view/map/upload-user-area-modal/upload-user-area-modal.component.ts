import { Component } from '@angular/core';
import { DialogRef } from '@src/app/shared/dialog/dialog-ref';
import AreaService from "@data/area/area.service";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { UploadedUserDefinedArea } from "@data/area/area.interfaces";
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";
import { AreaActions } from "@data/area";
import { finalize } from "rxjs/operators";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { ServerError } from "@data/message/message.interfaces";

@Component({
  selector: 'app-upload-user-area-modal',
  templateUrl: './upload-user-area-modal.component.html',
  styleUrls: ['./upload-user-area-modal.component.scss']
})
export class UploadUserAreaModalComponent {
  readonly requiredFileType: string;
  errorIcon = faExclamationCircle;

  // Component state variables
  loading = false;
  uploadedArea?: UploadedUserDefinedArea;
  firstFeatureId?: string;
  inspectionError?: ServerError;

  constructor(private areaService: AreaService,
              private store: Store<State>,
              private dialog: DialogRef,
              private config: DialogConfig,
  ) {
    this.requiredFileType = config.data.mimeType;
  }

  onFileSelect(event: Event) {
    this.clearState();
    this.loading = true;
    const files = (event.target as HTMLInputElement).files; //[0];
    // const files = (event.target as HTMLInputElement).files;
    if (files?.length) {
      const file = files[0];
      const formdata = new FormData();
      formdata.append("package", file);
      // TODO: Handle failed inspection

      this.areaService.uploadUserArea(formdata).pipe(
        finalize(() => this.loading = false)
      ).subscribe(inspectionResults => {
          this.uploadedArea = inspectionResults
          if (inspectionResults.featureIdentifiers.length > 0)
            this.firstFeatureId = inspectionResults.featureIdentifiers[0]
        },
        ({ status, error }) => {
          // TODO: Show in dialog instead of new modal
          this.inspectionError = error;
          // this.store.dispatch(AreaActions.inspectUserUploadedAreaFailure({ error: { status, message } }));
        }
      );
    }
  }

  get hasWGS84SRID() {
    return this.uploadedArea && this.uploadedArea.srid !== 4326;
  }

  get packageHasMultipleFeatures() {
    return this.uploadedArea && this.uploadedArea.featureIdentifiers.length>1;
  }

  confirmImport() {
    this.areaService.confirmUserAreaImport(this.uploadedArea!.key)
      .subscribe(
      importedArea => this.dialog.close(importedArea),
      ({ status, error: message }) => {
        this.store.dispatch(AreaActions.createUserDefinedAreaFailure({ error: { status, message} }));
        this.dialog.close();
      }     // TODO: Show some message?
    );
  }

  cancel = () => {
    this.dialog.close();
  };

  private clearState() {
    this.uploadedArea = this.inspectionError = this.firstFeatureId = undefined;
  }
}
