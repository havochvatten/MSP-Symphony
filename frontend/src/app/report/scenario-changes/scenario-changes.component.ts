import { Component, Input } from '@angular/core';
import { BandMap } from '../calculation-report.component';
import { ReportChanges } from "@data/calculation/calculation.interfaces";
import { isEmpty } from "lodash";
import { ChangesProperty } from "@data/scenario/scenario.interfaces";
import { BandTypes } from "@data/metadata/metadata.interfaces";

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
  @Input() comparisonReport = false;

  anyChanges() {
    return this.anyScenarioChanges() || this.anyAreaChanges();

  }

  anyScenarioChanges() {
    return Object.keys(this.allBaseChanges()).length > 0;
  }

  allBaseChanges() {
    const changes: ChangesProperty = {};
    for(const category of BandTypes) {
      for (const bandNumber in this.scenarioChanges.baseChanges[category]) {
        changes[bandNumber] = this.scenarioChanges.baseChanges[category][bandNumber];
      }
    }
    return changes;
  }

  allAreaChanges(): { [key: number]: ChangesProperty } {
    const changes: { [key: number]: ChangesProperty } = {};
    for(const areaId in this.scenarioChanges.areaChanges) {
      changes[areaId] = {};
      for(const category of BandTypes) {
        for(const bandName in this.scenarioChanges.areaChanges[areaId][category]) {
          changes[areaId][bandName] = this.scenarioChanges.areaChanges[areaId][category][bandName];
        }
      }
    }
    return changes;
  }

  anyAreaChanges() {
    const areaChanges = this.allAreaChanges();
    if(Object.keys(areaChanges).length > 0) {
      for(const areaId in areaChanges) {
        if(Object.keys(areaChanges[areaId]).length > 0) {
          return true;
        }
      }
    }
    return false;
  }

  protected readonly isEmpty = isEmpty;
}
