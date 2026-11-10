import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '@shared/shared.module';
import { TranslationSetupModule } from '../app-translation-setup.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoginComponent } from './login.component';
import { UserSelectors } from '@data/user';
import { BrandingService } from '@src/app/core/branding/branding.service';
import { TranslateService } from '@ngx-translate/core';

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
        }),
        {
          provide: BrandingService,
          useValue: {
            configData: {
              showLogos: true,
              loginLogoSrc: 'login-logo.svg',
              loginLogoAlt: { en: 'Our login logo' },
              logoSrc: 'logo.svg',
              logoAlt: { en: 'Our logo' }
            }
          }
        }
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

  it('renders the logo alt texts from the branding config', () => {
    expect(fixture.nativeElement.querySelector('img.duck').getAttribute('alt')).toBe(
      'Our login logo'
    );
    expect(fixture.nativeElement.querySelector('img.logo').getAttribute('alt')).toBe('Our logo');
  });

  it('shows the bottom logo for the current language', () => {
    const translate = TestBed.inject(TranslateService);
    // Preloaded translations make use() switch synchronously instead of fetching the language files
    translate.setTranslation('sv', {});
    translate.setTranslation('fr', {});
    TestBed.inject(BrandingService).configData.logoSrc = { sv: 'logo-sv.svg', en: 'logo-en.svg' };
    const logo = () => fixture.nativeElement.querySelector('img.logo').getAttribute('src');

    translate.use('sv');
    fixture.detectChanges();
    expect(logo()).toBe('logo-sv.svg');

    translate.use('fr');
    fixture.detectChanges();
    expect(logo()).toBe('logo-en.svg');
  });
});
