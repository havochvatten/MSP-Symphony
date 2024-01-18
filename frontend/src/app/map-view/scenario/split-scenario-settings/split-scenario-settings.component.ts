import { Component, ElementRef, ViewChild } from '@angular/core';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { ScenarioSplitDialogResult, ScenarioSplitOptions } from "@data/scenario/scenario.interfaces";


@Component({
  selector: 'app-split-scenario-settings',
  templateUrl: './split-scenario-settings.component.html',
  styleUrls: ['./split-scenario-settings.component.scss']
})
export class SplitScenarioSettingsComponent {

  @ViewChild('batchName') scenarioNameInput!: ElementRef<HTMLInputElement>;

  options: ScenarioSplitOptions;
  noAreaChanges: boolean;

  constructor(
    public dialog: DialogRef,
    private config: DialogConfig) {
    this.options = {
      batchName: this.config.data.scenarioName,
      applyAreaChanges: false,
      applyScenarioChanges: true,
      batchSelect: true
    };
    this.noAreaChanges = this.config.data.noAreaChanges;
  }

  splitScenario() {
    const result : ScenarioSplitDialogResult = {
      options: this.options,
      immediate: false
    };

    result.options.batchName = this.scenarioNameInput.nativeElement.value;

    this.dialog.close(result);
  }

  batchCalculate() {
    this.dialog.close({
      options: this.options,
      immediate: true
    });
  }

}
