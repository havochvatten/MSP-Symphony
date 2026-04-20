import { Component, Input } from '@angular/core';
import { BandType, HeatmapModel } from '@data/metadata/metadata.interfaces';

interface HeatmapModelRow {
  model: Exclude<HeatmapModel, 'none'>;
  labelKey: string;
}

@Component({
  selector: 'app-summary-model-accordion',
  templateUrl: './summary-model-accordion.component.html',
  styleUrls: ['./summary-model-accordion.component.scss'],
  standalone: false
})
export class SummaryModelAccordionComponent {
  @Input() title?: string;
  @Input() category!: BandType;
  @Input() scenarioActive = false;
  @Input() rows: ReadonlyArray<HeatmapModelRow> = [];
  @Input() isHeatmapModelLoaded!: (model: HeatmapModel) => boolean;
  @Input() isHeatmapModelSelected!: (model: HeatmapModel) => boolean;
  @Input() toggleHeatmapModel!: (model: HeatmapModel) => void;

  open = false;
  toggle: () => void = () => this.open = !this.open;
}
