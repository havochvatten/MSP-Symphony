import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BandSelectionComponent } from './band-selection.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { SharedModule } from '@src/app/shared/shared.module';
import { provideMockStore } from '@ngrx/store/testing';
import { initialState as area } from '@data/area/area.reducers';
import { initialState as scenario } from '@data/scenario/scenario.reducers';
import { SelectionLayoutComponent } from '../selection-layout/selection-layout.component';
import { StoreModule } from "@ngrx/store";

describe('BandSelectionComponent', () => {
  let fixture: ComponentFixture<BandSelectionComponent>,
      component: BandSelectionComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BandSelectionComponent, SelectionLayoutComponent],
      imports: [
        SharedModule,
        TranslationSetupModule,
        StoreModule.forRoot({}, {}),
      ],
      providers: [provideMockStore({
        initialState: {
          area: area,
          scenario: scenario
        }
      })]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BandSelectionComponent)
    component = fixture.componentInstance;
    fixture.detectChanges();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
