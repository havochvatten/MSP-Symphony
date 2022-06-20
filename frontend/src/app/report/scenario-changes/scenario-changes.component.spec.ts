import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenarioChangesComponent } from './scenario-changes.component';
import { TranslationSetupModule } from "@src/app/app-translation-setup.module";

function setUp() {
  const fixture: ComponentFixture<ScenarioChangesComponent> = TestBed.createComponent(ScenarioChangesComponent);
  const component: ScenarioChangesComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('ScenarioChangesComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScenarioChangesComponent ],
      imports: [TranslationSetupModule]
    })
    .compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
