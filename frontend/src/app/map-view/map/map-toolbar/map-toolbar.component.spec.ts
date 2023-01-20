import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MapToolbarComponent } from './map-toolbar.component';
import {
  ToolbarZoomButtonsComponent,
  ToolbarButtonComponent
} from '../toolbar-button/toolbar-button.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { MapOpacitySliderComponent } from '../map-opacity-slider/map-opacity-slider.component';

describe('MapToolbarComponent', () => {
  let fixture: ComponentFixture<MapToolbarComponent>,
      component: MapToolbarComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, TranslationSetupModule],
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
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger toggleDraw on button click', waitForAsync(() => {
    spyOn(component, 'onToggleDraw');
    const button = fixture.debugElement.children[2].nativeElement;
    button.click();
    fixture.whenStable().then(() => {
      expect(component.onToggleDraw).toHaveBeenCalledTimes(1);
    });
  }));

  it('should trigger zoomIn on button click', waitForAsync(() => {
    spyOn(component, 'onClickZoomIn');
    const button = fixture.debugElement.children[0].nativeElement.querySelectorAll('button')[0];
    button.click();
    fixture.whenStable().then(() => {
      expect(component.onClickZoomIn).toHaveBeenCalledTimes(1);
    });
  }));

  it('should trigger zoomOut on button click', waitForAsync(() => {
    spyOn(component, 'onClickZoomOut');
    const button = fixture.debugElement.children[0].nativeElement.querySelectorAll('button')[1];
    button.click();
    fixture.whenStable().then(() => {
      expect(component.onClickZoomOut).toHaveBeenCalledTimes(1);
    });
  }));
});
