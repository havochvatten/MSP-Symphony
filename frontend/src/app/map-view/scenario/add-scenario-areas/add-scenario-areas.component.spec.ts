import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreModule } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Area } from '@data/area/area.interfaces';
import { provideHttpClient } from '@angular/common/http';
import { AddScenarioAreasComponent } from './add-scenario-areas.component';
import { IconButtonComponent } from '@shared/icon-button/icon-button.component';
import { SharedModule } from '@shared/shared.module';
import { ScenarioEditorModule } from '@src/app/map-view/scenario/scenario-editor.module';
import { provideMockStore } from '@ngrx/store/testing';
import { initialState as area } from '@data/area/area.reducers';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { initialState as user } from '@data/user/user.reducers';
import { provideZonelessChangeDetection } from '@angular/core';

describe('AddScenarioAreasComponent', () => {
  let component: AddScenarioAreasComponent;
  let fixture: ComponentFixture<AddScenarioAreasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ScenarioEditorModule,
        SharedModule,
        StoreModule.forRoot({}, {}),
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideMockStore({
          initialState: {
            area,
            metadata,
            user
          }
        }),
        provideZonelessChangeDetection()
      ],
      declarations: [AddScenarioAreasComponent, IconButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AddScenarioAreasComponent);
    component = fixture.componentInstance;
    component.noneSelectedTipKey = 'stk';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('tooltip and accessible name of the + button', () => {
    const button = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    const select = (...names: string[]) => {
      component.selectedAreas = names.map((name) => ({ name }) as Area);
      fixture.detectChanges();
    };

    beforeEach(() => {
      const translate = TestBed.inject(TranslateService);
      translate.setTranslation('en', {
        none: 'Select areas first',
        single: 'Create new scenario for {{area}}',
        multiple: 'Create new grouped scenario'
      });
      translate.use('en');
      component.noneSelectedTipKey = 'none';
      component.singleSelectedTipKey = 'single';
      component.multipleSelectedTipKey = 'multiple';
    });

    it('names the area when one area is selected', () => {
      select('Kattegatt');
      expect(button().title).toBe('Create new scenario for Kattegatt');
      expect(button().getAttribute('aria-label')).toBe('Create new scenario for Kattegatt');
    });

    it('uses the grouped text when several areas are selected', () => {
      select('Kattegatt', 'Skagerrak');
      expect(button().title).toBe('Create new grouped scenario');
      expect(button().getAttribute('aria-label')).toBe('Create new grouped scenario');
    });

    it('asks for a selection when no area is selected', () => {
      select();
      expect(button().title).toBe('Select areas first');
      expect(button().getAttribute('aria-label')).toBe('Select areas first');
    });
  });
});
