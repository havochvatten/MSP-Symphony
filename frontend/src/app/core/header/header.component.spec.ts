import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { HeaderComponent } from './header.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { UserMenuToggleComponent } from './user-menu-toggle/user-menu-toggle.component';

function setUp() {
  const fixture: ComponentFixture<HeaderComponent> = TestBed.createComponent(HeaderComponent);
  const component: HeaderComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('HeaderComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [HeaderComponent, UserMenuToggleComponent],
      providers: [provideMockStore()]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    component.title = 'Symphony'
    expect(component).toBeTruthy();
  });
});
