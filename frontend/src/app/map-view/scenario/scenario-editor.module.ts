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
import {
  HavAccordionModule,
  HavButtonModule,
  HavCheckboxModule,
  HavRadioButtonModule,
  HavSelectModule,
  HavSpinnerModule
} from "hav-components";
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
    HavButtonModule,
    HavAccordionModule,
    HavCheckboxModule,
    HavRadioButtonModule,
    HavSpinnerModule,
    HavSelectModule,
    FormsModule,
  ],
  exports: [ScenarioEditorComponent]
})
export class ScenarioEditorModule {}
