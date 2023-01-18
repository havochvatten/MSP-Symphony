import { Component, Input } from '@angular/core';
import { BandMap } from '../calculation-report.component';
import { FeatureCollection } from "geojson";

// TODO Show addition or removal of non-default layer selection (i.e. climate)?
@Component({
  selector: 'app-scenario-changes',
  templateUrl: './scenario-changes.component.html',
  styleUrls: ['./scenario-changes.component.scss']
})
export class ScenarioChangesComponent {
  @Input() name = '';
  @Input() scenarioChanges?: FeatureCollection;
  @Input() bandMap: BandMap = { b: {}, e: {} }; // Not used
}
