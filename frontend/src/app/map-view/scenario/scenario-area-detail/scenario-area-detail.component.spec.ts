import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenarioAreaDetailComponent } from './scenario-area-detail.component';

describe('ScenarioAreaDetailComponent', () => {
  let component: ScenarioAreaDetailComponent;
  let fixture: ComponentFixture<ScenarioAreaDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScenarioAreaDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScenarioAreaDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
