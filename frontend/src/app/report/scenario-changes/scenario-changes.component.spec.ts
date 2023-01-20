import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScenarioChangesComponent } from './scenario-changes.component';
import { TranslationSetupModule } from "@src/app/app-translation-setup.module";

describe('ScenarioChangesComponent', () => {
  let fixture: ComponentFixture<ScenarioChangesComponent>,
      component: ScenarioChangesComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ScenarioChangesComponent ],
      imports: [TranslationSetupModule]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ScenarioChangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
