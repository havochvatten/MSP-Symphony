import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HavButtonModule } from 'hav-components';
import { provideMockStore } from '@ngrx/store/testing';
import { PopupMessageComponent } from './popup-message.component';

function setUp() {
  const fixture: ComponentFixture<PopupMessageComponent> = TestBed.createComponent(PopupMessageComponent);
  const component: PopupMessageComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('PopupMessageComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupMessageComponent ],
      imports: [HavButtonModule],
      providers: [provideMockStore()]
    })
    .compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
