import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ResultColorScaleComponent } from './result-color-scale.component';

describe('ResultColorScaleComponent', () => {
  let fixture: ComponentFixture<ResultColorScaleComponent>,
      component: ResultColorScaleComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultColorScaleComponent ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ResultColorScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
