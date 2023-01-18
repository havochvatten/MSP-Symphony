import { NgModule } from '@angular/core';
import { ScenarioEditorComponent } from "@src/app/map-view/scenario/scenario-editor.component";
import { ScenarioDetailComponent } from "@src/app/map-view/scenario/scenario-detail/scenario-detail.component";
import { ScenarioListComponent } from "@src/app/map-view/scenario/scenario-list/scenario-list.component";
import { SharedModule } from "@shared/shared.module";
import {
  MatrixSelectionComponent
} from "@src/app/map-view/scenario/scenario-detail/matrix-selection/matrix-selection.component";
import {
  NormalizationSelectionComponent
} from "@src/app/map-view/scenario/scenario-detail/normalization-selection/normalization-selection.component";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [
    ScenarioEditorComponent,
    ScenarioListComponent,
    ScenarioDetailComponent,
    MatrixSelectionComponent,
    NormalizationSelectionComponent,
  ],
  imports: [
    SharedModule,
    FormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  exports: [ScenarioEditorComponent]
})
export class ScenarioEditorModule {}
