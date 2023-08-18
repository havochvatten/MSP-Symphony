import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScenarioListComponent } from './scenario-list.component';
import { StoreModule } from "@ngrx/store";
import { HttpClientModule } from "@angular/common/http";
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

describe('ScenarioListComponent', () => {
  let component: ScenarioListComponent;
  let fixture: ComponentFixture<ScenarioListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ScenarioEditorModule,
        SharedModule,
        HttpClientModule,
        StoreModule.forRoot({},{}),
        TranslateModule.forRoot()
      ],
      providers:[
        TranslateService,
        provideMockStore(
          { initialState: {
            metadata: metadata,
            scenario: scenario,
            area: area,
            user: { baseline: undefined }
          }})
      ],
      declarations: [ ScenarioListComponent, AddScenarioAreasComponent, IconButtonComponent, IconComponent]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ScenarioListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
