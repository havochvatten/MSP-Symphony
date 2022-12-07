import { NgModule } from '@angular/core';
import { EcoSliderComponent } from './band-selection/eco-slider/eco-slider.component';
import { SharedModule } from '../shared/shared.module';
import {
  HavAccordionModule,
  HavButtonModule,
  HavCheckboxModule,
  HavRadioButtonModule,
  HavSelectModule,
  HavSpinnerModule
} from 'hav-components';
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
import {
  DeleteUserAreaConfirmationDialogComponent
} from './area-selection/delete-user-area-confirmation-dialog/delete-user-area-confirmation-dialog.component';
import { CheckboxAccordionComponent } from './band-selection/checkbox-accordion/checkbox-accordion.component';
import {
  MatrixTableComponent
} from './scenario/scenario-detail/matrix-selection/matrix-table/matrix-table.component';
import { FormsModule } from "@angular/forms";
import { UploadUserAreaModalComponent } from "@src/app/map-view/map/upload-user-area-modal/upload-user-area-modal.component";
import { ScenarioEditorModule } from "@src/app/map-view/scenario/scenario-editor.module";
import {
  DeleteScenarioConfirmationDialogComponent
} from "@src/app/map-view/scenario/scenario-detail/delete-scenario-confirmation-dialog/delete-scenario-confirmation-dialog.component";
import { ConfirmResetComponent } from './confirm-reset/confirm-reset.component';
import { MetaInfoComponent } from './meta-info/meta-info.component';
import { AnchorPipe } from "@shared/anchor.pipe";
import { DeleteCalculationConfirmationDialogComponent } from './calculation-history/delete-calculation-confirmation-dialog/delete-calculation-confirmation-dialog.component';

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
    DeleteUserAreaConfirmationDialogComponent,
    DeleteScenarioConfirmationDialogComponent,
    CheckboxAccordionComponent,
    MatrixTableComponent,
    ConfirmResetComponent,
    MetaInfoComponent,
    DeleteCalculationConfirmationDialogComponent,
  ],
    imports: [
        SharedModule,
        HavButtonModule,
        HavAccordionModule,
        HavCheckboxModule,
        HavRadioButtonModule,
        CoreModule,
        HavSpinnerModule,
        HavSelectModule,
        FormsModule,
        ScenarioEditorModule
    ],
  providers: [AnchorPipe],
  exports: [MainViewComponent]
})
export class MapViewModule {}
