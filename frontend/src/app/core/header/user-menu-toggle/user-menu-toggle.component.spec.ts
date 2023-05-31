import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserMenuToggleComponent } from './user-menu-toggle.component';
import { SharedModule } from '@shared/shared.module';

describe('UserMenuToggleComponent', () => {
  let fixture: ComponentFixture<UserMenuToggleComponent>,
      component: UserMenuToggleComponent;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [UserMenuToggleComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(UserMenuToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
