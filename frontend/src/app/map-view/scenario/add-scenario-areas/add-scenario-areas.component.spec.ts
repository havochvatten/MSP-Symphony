import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreModule } from "@ngrx/store";
import { TranslateModule } from "@ngx-translate/core";
import { HttpClientModule } from "@angular/common/http";
import { AddScenarioAreasComponent } from './add-scenario-areas.component';
import { IconButtonComponent } from "@shared/icon-button/icon-button.component";
import { SharedModule } from "@shared/shared.module";
import { ScenarioEditorModule } from "@src/app/map-view/scenario/scenario-editor.module";

describe('AddScenarioAreasComponent', () => {
  let component: AddScenarioAreasComponent;
  let fixture: ComponentFixture<AddScenarioAreasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ScenarioEditorModule,
        HttpClientModule,
        SharedModule,
        StoreModule.forRoot({}, {}),
        TranslateModule.forRoot()
      ],
      declarations: [ AddScenarioAreasComponent, IconButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddScenarioAreasComponent);
    component = fixture.componentInstance;
    component.noneSelectedTipKey = 'stk';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
