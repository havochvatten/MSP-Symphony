import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { initialState as scenario } from '@data/scenario/scenario.reducers';
import { SliderControlsComponent } from './slider-controls.component';
import { EcoSliderComponent } from '../eco-slider/eco-slider.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { StoreModule } from "@ngrx/store";
import { MatCheckboxModule } from "@angular/material/checkbox";

describe('SliderControlsComponent', () => {
  let fixture: ComponentFixture<SliderControlsComponent>,
      component: SliderControlsComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslationSetupModule,
        StoreModule.forRoot({},{}),
        MatCheckboxModule
      ],
      declarations: [SliderControlsComponent, EcoSliderComponent],
      providers: [provideMockStore({
        initialState: {
          metadata: metadata,
          scenario: scenario
        }
      })]
    }).compileComponents();
    fixture = TestBed.createComponent(SliderControlsComponent);
    component = fixture.componentInstance;
    component.band = {
      accessUserRestrictions: "",
      authorEmail: "",
      authorOrganisation: "",
      bandNumber: 0,
      dataOwner: "",
      dataOwnerLocal: "",
      dataSources: "",
      dateCreated: "",
      defaultSelected: false,
      descriptiveKeywords: "",
      displayName: "",
      lineage: "",
      maintenanceInformation: "",
      mapAcknowledgement: "",
      marinePlaneArea: "",
      metadataDate: "",
      metadataEmail: "",
      metadataFileName: "",
      metadataLanguage: "",
      metadataOrganisation: "",
      metadataOrganisationLocal: "",
      otherRestrictions: "",
      ownerEmail: "",
      rasterFileName: "",
      rasterSpatialReferenceSystem: "",
      recommendations: "",
      securityClassification: "",
      spatialPresentation: "",
      status: "",
      summary: "",
      summaryLocal: "",
      symphonyDataType: "",
      theme: "",
      titleLocal: "",
      topicCategory: "",
      useLimitations: "",
      title: '',
      statePath: [''],
      methodSummary: '',
      limitationsForSymphony: '',
      valueRange: '',
      dataProcessing: ''
    }
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
