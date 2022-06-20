import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMenuToggleComponent } from './user-menu-toggle.component';
import { SharedModule } from '@src/app/shared/shared.module';

function setUp() {
  const fixture: ComponentFixture<UserMenuToggleComponent> = TestBed.createComponent(UserMenuToggleComponent);
  const component: UserMenuToggleComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('UserMenuToggleComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [UserMenuToggleComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
