import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IconComponent } from './icon.component';

describe('IconComponent', () => {
  let fixture: ComponentFixture<IconComponent>,
      component: IconComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [IconComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(IconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
