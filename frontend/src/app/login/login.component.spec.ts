import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '@shared/shared.module';
import { TranslationSetupModule } from '../app-translation-setup.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoginComponent } from './login.component';
import { UserSelectors } from '@data/user';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        SharedModule,
        TranslationSetupModule,
        MatFormFieldModule,
        MatInputModule
      ],
      declarations: [LoginComponent],
      providers: [
        provideMockStore({
          initialState: { user: { baseline: undefined } },
          selectors: [{ selector: UserSelectors.selectIsInitialLoading, value: false }]
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create loginForm with nonNullable controls as class property', () => {
    expect(component.loginForm).toBeTruthy();
    expect(component.loginForm.get('username')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should set loading observable to selectIsInitialLoading', () => {
    expect(component.loading).toBeTruthy();
  });
});
