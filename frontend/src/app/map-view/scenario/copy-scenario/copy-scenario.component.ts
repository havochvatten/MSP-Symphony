import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { Scenario, ScenarioArea, ScenarioCopyOptions } from "@data/scenario/scenario.interfaces";
import { MatCheckbox, MatCheckboxChange } from "@angular/material/checkbox";

@Component({
  selector: 'app-copy-scenario',
  templateUrl: './copy-scenario.component.html',
  styleUrls: ['./copy-scenario.component.scss'],
  standalone: false
})
export class CopyScenarioComponent {
  private dialog = inject(DialogRef);
  private conf = inject(DialogConfig);


  scenario: Scenario;
  allAreasWithChanges: ScenarioArea[] = [];
  @ViewChild('scenarioName') scenarioNameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('includeChanges') areaSelect!: MatCheckbox;
  selectedAreaIds: number[] = [];
  areasWithoutChangeFmt: string;

  constructor() {
    const conf = this.conf;

    this.scenario = conf.data.scenario;
    this.allAreasWithChanges = this.scenario.areas.filter(a => !!a.changes);
    this.selectedAreaIds = this.allAreasWithChanges.map(a => a.id);
    this.areasWithoutChangeFmt =
      this.scenario.areas.filter(a => !a.changes).map(a => a.feature.properties!['name']).join(', ');
  }

  copy() {
    this.dialog.close(this.getOptions());
  }

  getOptions(): ScenarioCopyOptions {
    return {
      name: this.scenarioNameInput.nativeElement.value,
      includeScenarioChanges: this.areaSelect.checked,
      areaChangesToInclude: this.selectedAreaIds
    }
  }

  cancel() {
    this.dialog.close(null);
  }

  areaSelection($event: MatCheckboxChange, areaId: number) {
    if ($event.checked) {
      this.selectedAreaIds.push(areaId);
    } else {
      this.selectedAreaIds = this.selectedAreaIds.filter(id => id !== areaId);
    }
  }
}
