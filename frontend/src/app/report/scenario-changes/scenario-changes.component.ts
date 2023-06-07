import { Component, Input } from '@angular/core';
import { BandMap } from '../calculation-report.component';
import { ReportChanges } from "@data/calculation/calculation.interfaces";
import { isEmpty } from "lodash";

// TODO Show addition or removal of non-default layer selection (i.e. climate)?
@Component({
  selector: 'app-scenario-changes',
  templateUrl: './scenario-changes.component.html',
  styleUrls: ['./scenario-changes.component.scss']
})
export class ScenarioChangesComponent {
  @Input() name = '';
  @Input() scenarioChanges!: ReportChanges;
  @Input() areaDict!: Map<number, string>;
  @Input() bandMap: BandMap = { b: {}, e: {} }; // Not used
  anyChanges() {
    return this.anyScenarioChanges() || this.anyAreaChanges();
  }

  anyScenarioChanges() {
    return Object.keys(this.scenarioChanges.baseChanges).length > 0;
  }

  anyAreaChanges() {
    if(Object.keys(this.scenarioChanges.areaChanges).length > 0) {
      for(const areaId in this.scenarioChanges.areaChanges) {
        if(Object.keys(this.scenarioChanges.areaChanges[areaId]).length > 0) {
          return true;
        }
      }
    }
    return false;
  }

  isEmpty = isEmpty;
}
