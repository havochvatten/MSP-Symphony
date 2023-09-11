import { NgModule } from '@angular/core';
import { ScenarioEditorComponent } from "@src/app/map-view/scenario/scenario-editor.component";
import { ScenarioDetailComponent } from "@src/app/map-view/scenario/scenario-detail/scenario-detail.component";
import { ScenarioListComponent } from "@src/app/map-view/scenario/scenario-list/scenario-list.component";
import { SharedModule } from "@shared/shared.module";
import {
  MatrixSelectionComponent
} from "@src/app/map-view/scenario/scenario-area-detail/matrix-selection/matrix-selection.component";
import {
  NormalizationSelectionComponent
} from "@src/app/map-view/scenario/scenario-detail/normalization-selection/normalization-selection.component";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { FormsModule } from "@angular/forms";
import { OrdinalPipe } from "@shared/ordinal.pipe";
import { ScenarioAreaDetailComponent } from './scenario-area-detail/scenario-area-detail.component';
import { ChangesListComponent } from './scenario-detail/changes-list/changes-list.component';
import { AddScenarioAreasComponent } from './add-scenario-areas/add-scenario-areas.component';
import { ChangesOverviewComponent } from './changes-overview/changes-overview.component';
import { CopyScenarioComponent } from './copy-scenario/copy-scenario.component';
import { MatInputModule } from "@angular/material/input";
import { TransferChangesComponent } from './transfer-changes/transfer-changes.component';
import { OverviewInlineBandChangeComponent } from './changes-overview/overview-inline-band-change/overview-inline-band-change.component';
import { SplitScenarioSettingsComponent } from './split-scenario-settings/split-scenario-settings.component';

@NgModule({
  declarations: [
    ScenarioEditorComponent,
    ScenarioListComponent,
    ScenarioDetailComponent,
    MatrixSelectionComponent,
    NormalizationSelectionComponent,
    ScenarioAreaDetailComponent,
    ChangesListComponent,
    AddScenarioAreasComponent,
    ChangesOverviewComponent,
    CopyScenarioComponent,
    TransferChangesComponent,
    OverviewInlineBandChangeComponent,
    SplitScenarioSettingsComponent,
  ],
    imports: [
        SharedModule,
        FormsModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatSelectModule,
        MatCheckboxModule,
        MatInputModule
    ],
  providers: [ OrdinalPipe ],
  exports: [
      ScenarioEditorComponent,
      ChangesListComponent,
      AddScenarioAreasComponent
  ]
})
export class ScenarioEditorModule {}
