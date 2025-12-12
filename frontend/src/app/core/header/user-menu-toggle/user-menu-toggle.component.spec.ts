import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMenuToggleComponent } from './user-menu-toggle.component';
import { SharedModule } from '@shared/shared.module';
import { provideZonelessChangeDetection } from "@angular/core";

describe('UserMenuToggleComponent', () => {
  let fixture: ComponentFixture<UserMenuToggleComponent>,
      component: UserMenuToggleComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [
        provideZonelessChangeDetection()
      ],
      declarations: [UserMenuToggleComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(UserMenuToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
