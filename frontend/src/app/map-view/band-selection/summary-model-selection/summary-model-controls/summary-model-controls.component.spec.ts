import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NgModuleRef } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

import { SummaryModelControlsComponent } from './summary-model-controls.component';
import { DialogService } from '@shared/dialog/dialog.service';
import { DataLayerService } from '@src/app/map-view/map/layers/data-layer.service';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { initialState as calculation } from '@data/calculation/calculation.reducers';

describe('SummaryModelControlsComponent', () => {
  let fixture: ComponentFixture<SummaryModelControlsComponent>;
  let component: SummaryModelControlsComponent;

  const mockDialogService = { open: jasmine.createSpy('open') };
  const mockDataLayerService = { getSummaryModelDescription: () => of({}) };
  const mockNgModuleRef = { injector: {} };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}, {}),
        TranslateModule.forRoot()
      ],
      providers: [
        TranslateService,
        { provide: DialogService, useValue: mockDialogService },
        { provide: DataLayerService, useValue: mockDataLayerService },
        { provide: NgModuleRef, useValue: mockNgModuleRef },
        provideMockStore({
          initialState: {
            user: { baseline: undefined },
            metadata: metadata,
            calculation: calculation
          }
        }),
        provideZonelessChangeDetection()
      ],
      declarations: [SummaryModelControlsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryModelControlsComponent);
    component = fixture.componentInstance;
    component.modelCategory = 'ECOSYSTEM';
    component.summaryModel = 'simple';
    component.isSummaryModelSelected = () => false;
    component.toggleSummaryModel = () => {};
    component.isSummaryModelLoaded = () => true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
