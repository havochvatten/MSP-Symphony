import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Scenario } from "@data/scenario/scenario.interfaces";

@Component({
  selector: 'app-active-scenario-display',
  templateUrl: './active-scenario-display.component.html',
  styleUrls: ['./active-scenario-display.component.scss']
})
export class ActiveScenarioDisplayComponent {

  @Input() scenario!: Scenario;
  @Input() area: number | undefined;
  @Output() exit: EventEmitter<void> = new EventEmitter<void>();

  getScenarioName() {
    return this.scenario.name;
  }

  getAreaName() {
    if(this.area !== undefined && this.scenario?.areas[this.area] !== undefined) {
      return this.scenario?.areas[this.area].feature.properties!['name'];
    } else {
      return undefined;
    }
  }

  exitScenario() {
    this.exit.emit()
  }
}
