import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { EcoSliderComponent } from './eco-slider.component';
import { SharedModule } from '@shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { provideMockStore } from '@ngrx/store/testing';
import { initialState } from '@data/metadata/metadata.reducers';

describe('EcoSliderComponent', () => {
  let fixture: ComponentFixture<EcoSliderComponent>,
      component: EcoSliderComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslationSetupModule,
        RouterTestingModule
      ],
      declarations: [EcoSliderComponent],
      providers: [provideMockStore({ initialState: {
        metadata: initialState
      }})]
    }).compileComponents();
    fixture = TestBed.createComponent(EcoSliderComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
