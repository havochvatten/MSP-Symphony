import { Component, inject, Input, NgModuleRef } from '@angular/core';
import { DialogService } from '@shared/dialog/dialog.service';
import { MapViewModule } from '@src/app/map-view/map-view.module';
import { TranslateService } from '@ngx-translate/core';
import { DataLayerService } from '@src/app/map-view/map/layers/data-layer.service';
import { Store } from '@ngrx/store';
import { UserSelectors } from '@data/user';
import { Baseline } from '@data/user/user.interfaces';
import {
  ModelDescriptionDialogData,
  SummaryModelDialogComponent
} from '@src/app/map-view/band-selection/summary-model-selection/summary-model-dialog/summary-model-dialog.component';
import { SummaryModel, SummaryModelCategory } from '@data/calculation/calculation.interfaces';
import { take } from 'rxjs/operators';
import { MetadataSelectors } from '@data/metadata';

@Component({
  selector: 'app-summary-model-controls',
  templateUrl: './summary-model-controls.component.html',
  styleUrls: ['./summary-model-controls.component.scss'],
  standalone: false
})
export class SummaryModelControlsComponent {
  private readonly dialogService = inject(DialogService);
  private readonly moduleRef = inject(NgModuleRef<MapViewModule>);
  private readonly translateService = inject(TranslateService);
  private readonly dataLayerService = inject(DataLayerService);
  private readonly store = inject(Store);

  @Input() modelCategory!: SummaryModelCategory;
  @Input() summaryModelLabelKey?: string;
  @Input() summaryModel!: Exclude<SummaryModel, 'none'>;
  @Input() isSummaryModelSelected!: (model: SummaryModel) => boolean;
  @Input() toggleSummaryModel!: (model: SummaryModel) => void;
  @Input() isSummaryModelLoaded!: (model: SummaryModel) => boolean;

  baseline?: Baseline;

  constructor() {
    this.store.select(UserSelectors.selectBaseline).subscribe((baseline) => {
      this.baseline = baseline;
    });
  }

  showMetaDialog() {
    this.store
      .select(
        MetadataSelectors.selectSummaryModelDescription(this.modelCategory, this.summaryModel)
      )
      .pipe(take(1))
      .subscribe((desc) => {
        if (!desc) {
          console.warn('No description loaded for', this.modelCategory, this.summaryModel);
          return;
        }
        this.dialogService.open(SummaryModelDialogComponent, this.moduleRef, {
          data: {
            titleTranslationKey:
              desc.titleTranslationKey ||
              this.translateService.instant('map.summary-model.' + this.summaryModel),
            steps: desc.steps.map((step) => ({ ...step, normalization: step.normalization || '' }))
          } as ModelDescriptionDialogData
        });
      });
  }
}
