import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenarioListComponent } from './scenario-list.component';
import { StoreModule } from "@ngrx/store";
import { provideHttpClient } from "@angular/common/http";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { initialState as scenario } from '@data/scenario/scenario.reducers';
import { initialState as area } from '@data/area/area.reducers';
import { provideMockStore } from "@ngrx/store/testing";
import { IconButtonComponent } from "@shared/icon-button/icon-button.component";
import { IconComponent } from "@shared/icon/icon.component";
import { AddScenarioAreasComponent } from "@src/app/map-view/scenario/add-scenario-areas/add-scenario-areas.component";
import { SharedModule } from "@shared/shared.module";
import { ScenarioEditorModule } from "@src/app/map-view/scenario/scenario-editor.module";
import { provideZonelessChangeDetection } from "@angular/core";
import { MockStore } from "@ngrx/store/testing";
import { of } from "rxjs";
import { DialogService } from "@shared/dialog/dialog.service";
import { Scenario } from "@data/scenario/scenario.interfaces";
import { Area } from "@data/area/area.interfaces";
import { ScenarioActions } from "@data/scenario";
import { NewScenarioNameComponent } from "@src/app/map-view/scenario/new-scenario-name/new-scenario-name.component";
import * as Normalization from '@src/app/map-view/scenario/scenario-detail/normalization-selection/normalization-selection.component';

describe('ScenarioListComponent', () => {
  let component: ScenarioListComponent;
  let fixture: ComponentFixture<ScenarioListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ScenarioEditorModule,
        SharedModule,
        StoreModule.forRoot({},{}),
        TranslateModule.forRoot()
      ],
      providers:[
        TranslateService,
        provideHttpClient(),
        provideMockStore(
          { initialState: {
            metadata: metadata,
            scenario: scenario,
            area: area,
            user: { baseline: undefined }
          }}),
        provideZonelessChangeDetection()
      ],
      declarations: [ ScenarioListComponent, AddScenarioAreasComponent, IconButtonComponent, IconComponent]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ScenarioListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('createScenario', () => {
    const created = { id: 7, name: 'x' } as Scenario;
    let mockStore: MockStore;
    let dialogService: DialogService;
    let that: AddScenarioAreasComponent;

    beforeEach(() => {
      const translate = TestBed.inject(TranslateService);
      translate.setTranslation('en', {
        map: { editor: { list: { 'scenario-name': 'Untitled scenario', 'scenario-name-template': 'Scenario {{area}}' } } }
      });
      translate.use('en');

      mockStore = TestBed.inject(MockStore);
      mockStore.setState({
        metadata, area, user: { baseline: undefined },
        scenario: { ...scenario, scenarios: [{ id: 1, name: 'Scenario Kattegatt', areas: [] } as unknown as Scenario] }
      });
      spyOn(mockStore, 'dispatch');

      dialogService = TestBed.inject(DialogService);

      that = {
        selectedComponents: { ecoComponent: [{ bandNumber: 1 }], pressureComponent: [{ bandNumber: 2 }] },
        baseline: { id: 1 },
        scenarioService: jasmine.createSpyObj('ScenarioService', { create: of(created), convertAreas: [] })
      } as unknown as AddScenarioAreasComponent;
    });

    it('suggests a unique single-area name', async () => {
      spyOn(dialogService, 'open').and.returnValue(Promise.resolve(null));
      await component.createScenario([{ name: 'Kattegatt' } as Area], that);
      expect(dialogService.open).toHaveBeenCalledWith(
        NewScenarioNameComponent, jasmine.anything(), { data: { suggestedName: 'Scenario Kattegatt 2' } });
    });

    it('suggests Untitled scenario for several areas', async () => {
      spyOn(dialogService, 'open').and.returnValue(Promise.resolve(null));
      await component.createScenario([{ name: 'Kattegatt' } as Area, { name: 'Skagerrak' } as Area], that);
      expect(dialogService.open).toHaveBeenCalledWith(
        NewScenarioNameComponent, jasmine.anything(), { data: { suggestedName: 'Untitled scenario' } });
    });

    it('creates nothing when cancelled', async () => {
      spyOn(dialogService, 'open').and.returnValue(Promise.resolve(null));
      await component.createScenario([{ name: 'Kattegatt' } as Area], that);
      expect(that.scenarioService.create).not.toHaveBeenCalled();
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('creates with the confirmed name', async () => {
      spyOn(dialogService, 'open').and.returnValue(Promise.resolve('My plan'));
      await component.createScenario([{ name: 'Kattegatt' } as Area], that);
      expect(that.scenarioService.create).toHaveBeenCalledWith(
        jasmine.objectContaining({ id: 1 }), 'My plan', [], Normalization.DEFAULT_OPTIONS, [1], [2]);
      expect(mockStore.dispatch).toHaveBeenCalledWith(ScenarioActions.addScenario({ scenario: created }));
    });

    it('uses the selection from when + was clicked', async () => {
      let confirm!: (name: string) => void;
      spyOn(dialogService, 'open').and.returnValue(new Promise(resolve => confirm = resolve));
      const pending = component.createScenario([{ name: 'Kattegatt' } as Area], that);
      await new Promise(resolve => setTimeout(resolve));
      that.baseline = { id: 99 } as AddScenarioAreasComponent['baseline'];
      that.selectedComponents = { ecoComponent: [], pressureComponent: [] };
      confirm('My plan');
      await pending;
      expect(that.scenarioService.create).toHaveBeenCalledWith(
        jasmine.objectContaining({ id: 1 }), 'My plan', [], Normalization.DEFAULT_OPTIONS, [1], [2]);
    });
  });
});
