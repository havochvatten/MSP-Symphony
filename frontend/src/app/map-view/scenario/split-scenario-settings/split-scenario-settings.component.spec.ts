import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitScenarioSettingsComponent } from './split-scenario-settings.component';
import { DialogService } from "@shared/dialog/dialog.service";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { TranslateModule } from "@ngx-translate/core";
import { MatCheckboxModule } from "@angular/material/checkbox";

describe('SplitScenarioSettingsComponent', () => {
  let component: SplitScenarioSettingsComponent;
  let fixture: ComponentFixture<SplitScenarioSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatCheckboxModule,
        TranslateModule.forRoot()
      ],
      providers: [
        DialogService,
        DialogRef,
        {
          provide: DialogConfig,
          useValue: {
            data: {
              scenarioName: '',
              noAreaChanges: true
            }
          }
        }
      ],
      declarations: [ SplitScenarioSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SplitScenarioSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
