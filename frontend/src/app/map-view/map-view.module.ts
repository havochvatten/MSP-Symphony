import { NgModule } from '@angular/core';
import { EcoSliderComponent } from './band-selection/eco-slider/eco-slider.component';
import { SharedModule } from '../shared/shared.module';
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from "@angular/material/legacy-progress-spinner";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MainViewComponent } from './main-view.component';
import { MapComponent } from './map/map.component';
import { SliderControlsComponent } from './band-selection/slider-controls/slider-controls.component';
import { MapToolbarComponent } from './map/map-toolbar/map-toolbar.component';
import { MapOpacitySliderComponent } from './map/map-opacity-slider/map-opacity-slider.component';
import {
  ToolbarButtonComponent,
  ToolbarZoomButtonsComponent
} from './map/toolbar-button/toolbar-button.component';
import { CoreModule } from '../core/core.module';
import { AreaSelectionComponent } from './area-selection/area-selection.component';
import { BandSelectionComponent } from './band-selection/band-selection.component';
import { SelectionLayoutComponent } from './selection-layout/selection-layout.component';
import { AreaGroupComponent, EditAreaComponent } from './area-selection/area-group/area-group.component';
import { CalculationHistoryComponent } from './calculation-history/calculation-history.component';
import { ComparisonComponent } from './comparison/comparison.component';
import { CreateUserAreaModalComponent } from './map/create-user-area-modal/create-user-area-modal.component';
import {
  RenameUserAreaModalComponent
} from './area-selection/rename-user-area-modal/rename-user-area-modal.component';
import { CheckboxAccordionComponent } from './band-selection/checkbox-accordion/checkbox-accordion.component';
import {
  MatrixTableComponent
} from './scenario/scenario-area-detail/matrix-selection/matrix-table/matrix-table.component';
import { FormsModule } from "@angular/forms";
import { UploadUserAreaModalComponent } from "@src/app/map-view/map/upload-user-area-modal/upload-user-area-modal.component";
import { ScenarioEditorModule } from "@src/app/map-view/scenario/scenario-editor.module";
import { ConfirmResetComponent } from './confirm-reset/confirm-reset.component';
import { MetaInfoComponent } from './meta-info/meta-info.component';
import { AnchorPipe } from "@shared/anchor.pipe";
import { DialogService } from "@shared/dialog/dialog.service";
import { MergeAreasModalComponent } from './map/merge-areas-modal/merge-areas-modal.component';
import { MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";
import { ActiveScenarioDisplayComponent } from './active-scenario-display/active-scenario-display.component';
import { BatchProgressComponent } from './batch-progress-display/batch-progress.component';

@NgModule({
  declarations: [
    MainViewComponent,
    EcoSliderComponent,
    MapComponent,
    SliderControlsComponent,
    ToolbarButtonComponent,
    ToolbarZoomButtonsComponent,
    MapToolbarComponent,
    MapOpacitySliderComponent,
    AreaSelectionComponent,
    BandSelectionComponent,
    SelectionLayoutComponent,
    AreaGroupComponent,
    EditAreaComponent,
    CalculationHistoryComponent,
    ComparisonComponent,
    CreateUserAreaModalComponent,
    UploadUserAreaModalComponent,
    RenameUserAreaModalComponent,
    CheckboxAccordionComponent,
    MatrixTableComponent,
    ConfirmResetComponent,
    MetaInfoComponent,
    MergeAreasModalComponent,
    ActiveScenarioDisplayComponent,
    BatchProgressComponent,
  ],
    imports: [
        SharedModule,
        CoreModule,
        FormsModule,
        ScenarioEditorModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        MatButtonModule,
        MatRadioModule
    ],
  providers: [AnchorPipe, DialogService],
  exports: [MainViewComponent, ComparisonComponent]
})
export class MapViewModule {}
