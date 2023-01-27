import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HavLoaderComponent } from './hav-loader.component';

describe('HavLoaderComponent', () => {
  let fixture: ComponentFixture<HavLoaderComponent>,
      component: HavLoaderComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HavLoaderComponent ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(HavLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
