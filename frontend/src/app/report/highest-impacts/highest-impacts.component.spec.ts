import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HighestImpactsComponent } from './highest-impacts.component';

describe('HighestImpactsComponent', () => {
  let fixture: ComponentFixture<HighestImpactsComponent>,
      component: HighestImpactsComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HighestImpactsComponent ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(HighestImpactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
