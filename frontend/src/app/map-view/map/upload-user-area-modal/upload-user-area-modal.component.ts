import { Component, OnInit } from '@angular/core';
import { DialogRef } from '@shared/dialog/dialog-ref';
import AreaService from "@data/area/area.service";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { UploadedUserDefinedArea } from "@data/area/area.interfaces";
import { Store } from "@ngrx/store";
import { State } from "@src/app/app-reducer";
import { AreaActions } from "@data/area";
import { finalize } from "rxjs/operators";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { ServerError } from "@data/message/message.interfaces";
import { FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-upload-user-area-modal',
  templateUrl: './upload-user-area-modal.component.html',
  styleUrls: ['./upload-user-area-modal.component.scss']
})
export class UploadUserAreaModalComponent implements OnInit {
  readonly requiredFileType: string;
  errorIcon = faExclamationCircle;


  // Component state variables
  loading = false;
  uploadedArea?: UploadedUserDefinedArea;
  firstFeatureId?: string;
  inspectionError?: ServerError;
  categories: { id: number; name: string }[] = [];
  isCreatingNew = false;
  customAreaName = '';

  categoryForm = new FormGroup({
    categoryId: new FormControl(''),
    newCategoryName: new FormControl('')
  });


  constructor(private areaService: AreaService,
              private store: Store<State>,
              private dialog: DialogRef,
              private config: DialogConfig,
  ) {
    this.requiredFileType = config.data.mimeType;
  }

  ngOnInit(): void {
    this.areaService.getCategories().subscribe(data => {
      this.categories = data;
    });


    this.categoryForm.get('categoryId')!.valueChanges.subscribe(value => {
  if (value === '__new__') {
    this.isCreatingNew = true;
    this.categoryForm.get('newCategoryName')!.setValidators(Validators.required);
  } else {
    this.isCreatingNew = false;
    this.categoryForm.get('newCategoryName')!.clearValidators();
  }
  this.categoryForm.get('newCategoryName')!.updateValueAndValidity();
});
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

    if (this.categoryForm.invalid) return;

    const categoryIdValue = this.categoryForm.get('categoryId')!.value;

    if (categoryIdValue === '__new__'){
      const newName = this.categoryForm.get('newCategoryName')!.value!;
      this.areaService.createCategory(newName).subscribe(createdCategory =>{
        this.doImport(createdCategory.id);
      });
    } else if (categoryIdValue && categoryIdValue !== '') {
        this.doImport(Number(categoryIdValue));
      } else {
        this.doImport(undefined);
      }
  }

  private doImport(categoryId?: number) {
    this.areaService.confirmUserAreaImport(this.uploadedArea!.key, categoryId)
      .subscribe(
      importedArea => {
        if (this.customAreaName && this.customAreaName.length > 0) {
          this.dialog.close({
            ...importedArea,
            areaNames: [this.customAreaName]
          });
        } else {
          this.dialog.close(importedArea);
        }
      },
        ({ status, error: message }) => {
          this.store.dispatch(AreaActions.createUserDefinedAreaFailure({ error: { status, message } }));
          this.dialog.close();
        }
      );
  }

  cancel = () => {
    this.dialog.close();
  };

  private clearState() {
    this.uploadedArea = this.inspectionError = this.firstFeatureId = undefined;
  }
}
