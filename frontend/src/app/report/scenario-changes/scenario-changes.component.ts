import { Component, Input } from '@angular/core';
import { ScenarioChange } from '@data/calculation/calculation.interfaces';
import { BandMap } from '../calculation-report.component';
import { FeatureCollection } from "geojson";

// TODO Show addition or removal of non-default layer selection (i.e. climate)?
@Component({
  selector: 'app-scenario-changes',
  templateUrl: './scenario-changes.component.html',
  styleUrls: ['./scenario-changes.component.scss']
})
export class ScenarioChangesComponent {
  @Input() name: string = '';
  @Input() scenarioChanges?: FeatureCollection;
  @Input() bandMap: BandMap = { b: {}, e: {} }; // Not used
}
