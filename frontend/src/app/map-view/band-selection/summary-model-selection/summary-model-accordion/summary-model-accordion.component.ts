import { Component, Input } from '@angular/core';
import { SummaryModel, SummaryModelCategory } from '@data/calculation/calculation.interfaces';

interface SummaryModelRow {
  model: Exclude<SummaryModel, 'none'>;
  label: string;
}

@Component({
  selector: 'app-summary-model-accordion',
  templateUrl: './summary-model-accordion.component.html',
  styleUrls: ['./summary-model-accordion.component.scss'],
  standalone: false
})
export class SummaryModelAccordionComponent {
  @Input() title?: string;
  @Input() modelCategory!: SummaryModelCategory;
  @Input() scenarioActive = false;
  @Input() rows: ReadonlyArray<SummaryModelRow> = [];
  @Input() isSummaryModelLoaded!: (model: SummaryModel) => boolean;
  @Input() isSummaryModelSelected!: (model: SummaryModel) => boolean;
  @Input() toggleSummaryModel!: (model: SummaryModel) => void;

  open = false;
  toggle: () => void = () => (this.open = !this.open);
}
