import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { TranslationSetupModule } from '../app-translation-setup.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from "@angular/material/input";
import { provideAnimations } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { provideZonelessChangeDetection } from "@angular/core";

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>,
      component: LoginComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        ReactiveFormsModule,
        TranslationSetupModule,
        RouterModule.forRoot([]),
        MatFormFieldModule,
        MatInputModule
      ],
      declarations: [LoginComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideMockStore({
          initialState: { user: { baseline: undefined } }
        }),
        provideAnimations()
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
