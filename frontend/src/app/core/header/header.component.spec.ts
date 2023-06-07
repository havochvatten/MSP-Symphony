import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { HeaderComponent } from './header.component';
import { SharedModule } from '@shared/shared.module';
import { UserMenuToggleComponent } from './user-menu-toggle/user-menu-toggle.component';
import { StoreModule } from "@ngrx/store";

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>,
      component: HeaderComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, StoreModule.forRoot({}, {})],
      declarations: [HeaderComponent, UserMenuToggleComponent],
      providers: [provideMockStore({
        initialState : { user: { baseline: undefined } }
      })]
    }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    component.title = 'Symphony'
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
