import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveScenarioDisplayComponent } from './active-scenario-display.component';

describe('ActiveScenarioDisplayComponent', () => {
  let component: ActiveScenarioDisplayComponent;
  let fixture: ComponentFixture<ActiveScenarioDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveScenarioDisplayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveScenarioDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
