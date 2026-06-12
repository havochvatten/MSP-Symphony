import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcoSliderComponent } from './eco-slider.component';
import { SharedModule } from '@shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { provideMockStore } from '@ngrx/store/testing';
import { initialState } from '@data/metadata/metadata.reducers';
import { RouterModule } from "@angular/router";
import { provideZonelessChangeDetection } from "@angular/core";
import { MatCheckboxModule } from "@angular/material/checkbox";

describe('EcoSliderComponent', () => {
  let fixture: ComponentFixture<EcoSliderComponent>,
      component: EcoSliderComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslationSetupModule,
        MatCheckboxModule,
        RouterModule.forRoot([])
      ],
      declarations: [EcoSliderComponent],
      providers: [
        provideMockStore({
          initialState: {
            metadata: initialState,
            user: {}
          }
        }),
        provideZonelessChangeDetection()
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(EcoSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.ngAfterViewInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
