import { Component, Input, NgModuleRef, inject } from '@angular/core';
import { BandType, HeatmapModel } from '@data/metadata/metadata.interfaces';
import { DialogService } from '@shared/dialog/dialog.service';
import { MetaInfoComponent } from '@src/app/map-view/meta-info/meta-info.component';
import { MapViewModule } from '@src/app/map-view/map-view.module';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-summary-model-controls',
  templateUrl: './summary-model-controls.component.html',
  styleUrls: ['./summary-model-controls.component.scss'],
  standalone: false,
})
export class SummaryModelControlsComponent {
  private readonly dialogService = inject(DialogService);
  private readonly moduleRef = inject(NgModuleRef<MapViewModule>);
  private readonly translateService = inject(TranslateService);
  private readonly summaryModelDescriptionMap: Record<
    Exclude<HeatmapModel, 'none'>,
    Record<BandType, string>
  > = {
    simple: {
      ECOSYSTEM: 'simpleEcosystemDescription',
      PRESSURE: 'simplePressureDescription',
    },
    balanced: {
      ECOSYSTEM: 'balancedEcosystemDescription',
      PRESSURE: 'balancedPressureDescription',
    },
  };

  @Input() category!: BandType;
  @Input() heatMapLabelKey?: string;
  @Input() heatmapModel!: Exclude<HeatmapModel, 'none'>;
  @Input() isHeatmapSelected!: (model: HeatmapModel) => boolean;
  @Input() toggleHeatmap!: (model: HeatmapModel) => void;
  @Input() isHeatmapModelLoaded!: (model: HeatmapModel) => boolean;

  getSummaryModelDescription(bandType: BandType, model: Exclude<HeatmapModel, 'none'>): string {
    const keySuffix = this.summaryModelDescriptionMap[model][bandType];
    return this.translateService.instant(`map.summary-model.${keySuffix}`);
  }

  showMetaDialog() {
    const translatedTitle = this.translateService.instant('map.summary-model.' + this.heatmapModel);
    const translatedDescription = this.getSummaryModelDescription(this.category, this.heatmapModel);

    const data = {
      band: {
        layerName: translatedTitle,
        title: translatedTitle,
        symphonyCategory: this.category,
        meta: {
          metaHeader: translatedTitle,
          metaData: translatedDescription,
        },
      },
    };

    this.dialogService.open(MetaInfoComponent, this.moduleRef, { data });
  }
}
