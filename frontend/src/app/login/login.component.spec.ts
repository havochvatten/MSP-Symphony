import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslationSetupModule } from '../app-translation-setup.module';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { provideAnimations } from "@angular/platform-browser/animations";

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>,
      component: LoginComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        ReactiveFormsModule,
        TranslationSetupModule,
        RouterTestingModule,
        MatFormFieldModule,
        MatInputModule
      ],
      declarations: [LoginComponent],
      providers: [provideMockStore({
        initialState: { user: { baseline: undefined } }
      }),
      provideAnimations()]
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
