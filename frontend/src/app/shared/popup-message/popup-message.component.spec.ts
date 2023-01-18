import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { provideMockStore } from '@ngrx/store/testing';
import { PopupMessageComponent } from './popup-message.component';

function setUp() {
  const fixture: ComponentFixture<PopupMessageComponent> = TestBed.createComponent(PopupMessageComponent);
  const component: PopupMessageComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('PopupMessageComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupMessageComponent ],
      providers: [provideMockStore()]
    })
    .compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
