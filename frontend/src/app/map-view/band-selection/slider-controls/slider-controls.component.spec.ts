import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { initialState as scenario } from '@data/scenario/scenario.reducers';
import { SliderControlsComponent } from './slider-controls.component';
import { EcoSliderComponent } from '../eco-slider/eco-slider.component';
import { SharedModule } from '@shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { StoreModule } from '@ngrx/store';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { provideZonelessChangeDetection } from '@angular/core';
import { MockStore } from '@ngrx/store/testing';
import { MetadataSelectors } from '@data/metadata';

describe('SliderControlsComponent', () => {
  let fixture: ComponentFixture<SliderControlsComponent>,
    component: SliderControlsComponent,
    el: HTMLElement;

  const setBand = (state: { visible: boolean; loaded: boolean }) => {
    fixture.componentRef.setInput('band', { ...component.band, ...state });
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslationSetupModule,
        StoreModule.forRoot({}, {}),
        MatCheckboxModule,
        MatProgressSpinnerModule
      ],
      declarations: [SliderControlsComponent, EcoSliderComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideMockStore({
          initialState: {
            metadata: metadata,
            scenario: scenario,
            user: {}
          }
        })
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(SliderControlsComponent);
    component = fixture.componentInstance;
    component.band = {
      title: '',
      bandNumber: 0,
      selected: false,
      symphonyCategory: 'ECOSYSTEM',
      reliability: null,
      meta: {
        accessUserRestrictions: '',
        authorEmail: '',
        authorOrganisation: '',
        dataOwner: '',
        dataOwnerLocal: '',
        dataSources: '',
        dateCreated: '',
        descriptiveKeywords: '',
        lineage: '',
        maintenanceInformation: '',
        mapAcknowledgement: '',
        marinePlaneArea: '',
        metadataDate: '',
        metadataEmail: '',
        metadataFileName: '',
        metadataLanguage: '',
        metadataOrganisation: '',
        metadataOrganisationLocal: '',
        otherRestrictions: '',
        ownerEmail: '',
        rasterFileName: '',
        rasterSpatialReferenceSystem: '',
        recommendations: '',
        securityClassification: '',
        spatialPresentation: '',
        status: '',
        summary: '',
        summaryLocal: '',
        symphonyDataType: '',
        theme: '',
        topicCategory: '',
        useLimitations: '',
        methodSummary: '',
        limitationsForSymphony: '',
        valueRange: '',
        dataProcessing: ''
      }
    };
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  // overrideSelector changes the shared memoized selector, so undo it before
  // other specs run.
  afterEach(() => TestBed.inject(MockStore).resetSelectors());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows an eye outside the hover box when the layer is on the map', () => {
    setBand({ visible: true, loaded: true });
    expect(el.querySelector('.on-map-eye')).not.toBeNull();
    expect(el.querySelector('.list-actions .on-map-eye')).toBeNull();
  });

  it('shows no extra eye while the layer is loading or when it is off', () => {
    setBand({ visible: true, loaded: false });
    expect(el.querySelector('.on-map-eye')).toBeNull();
    setBand({ visible: false, loaded: true });
    expect(el.querySelector('.on-map-eye')).toBeNull();
  });

  it('turns the layer off when the eye is clicked', () => {
    component.onChangeVisible = jasmine.createSpy('onChangeVisible');
    setBand({ visible: true, loaded: true });
    (el.querySelector('.on-map-eye') as HTMLElement).click();
    expect(component.onChangeVisible).toHaveBeenCalledWith(false, component.band);
  });

  it('ignores the reliability overlay', () => {
    const store = TestBed.inject(MockStore);
    store.overrideSelector(MetadataSelectors.selectVisibleReliability, {
      band: component.band,
      opaque: true
    });
    store.refreshState();
    setBand({ visible: false, loaded: true });
    expect(el.querySelector('.on-map-eye')).toBeNull();
  });
});
