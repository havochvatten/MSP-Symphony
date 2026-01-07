import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapToolbarComponent } from './map-toolbar.component';
import {
  ToolbarZoomButtonsComponent,
  ToolbarButtonComponent
} from '../toolbar-button/toolbar-button.component';
import { StoreModule } from "@ngrx/store";
import { SharedModule } from '@shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { MapOpacitySliderComponent } from '../map-opacity-slider/map-opacity-slider.component';
import { provideMockStore } from "@ngrx/store/testing";
import { initialState as user } from '@data/user/user.reducers';
import { provideZonelessChangeDetection } from "@angular/core";

describe('MapToolbarComponent', () => {
  let fixture: ComponentFixture<MapToolbarComponent>,
      component: MapToolbarComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslationSetupModule,
        StoreModule.forRoot({},{}),
      ],
      providers : [
        provideMockStore({
          initialState: {
            user
          }
        }),
        provideZonelessChangeDetection()
      ],
      declarations: [
        MapToolbarComponent,
        ToolbarZoomButtonsComponent,
        ToolbarButtonComponent,
        MapOpacitySliderComponent
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(MapToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger toggleDraw on button click', async () => {
    spyOn(component, 'onToggleDraw');
    const button = fixture.debugElement.children[2].nativeElement;
    button.click();
    await fixture.whenStable();
    expect(component.onToggleDraw).toHaveBeenCalledTimes(1);
  });

  it('should trigger zoomIn on button click', async () => {
    spyOn(component, 'onClickZoomIn');
    const button = fixture.debugElement.children[0].nativeElement.querySelectorAll('button')[0];
    button.click();
    await fixture.whenStable();
    expect(component.onClickZoomIn).toHaveBeenCalledTimes(1);
  });

  it('should trigger zoomOut on button click', async () => {
    spyOn(component, 'onClickZoomOut');
    const button = fixture.debugElement.children[0].nativeElement.querySelectorAll('button')[1];
    button.click();
    await fixture.whenStable();
    expect(component.onClickZoomOut).toHaveBeenCalledTimes(1);
  });
});
