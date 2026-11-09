import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { HeaderComponent } from './header.component';
import { SharedModule } from '@shared/shared.module';
import { UserMenuToggleComponent } from './user-menu-toggle/user-menu-toggle.component';
import { StoreModule } from "@ngrx/store";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { provideZonelessChangeDetection } from "@angular/core";
import { BrandingService } from "@src/app/core/branding/branding.service";
import { DialogService } from "@shared/dialog/dialog.service";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { provideRouter } from "@angular/router";

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>,
      component: HeaderComponent,
      dialogResult: string | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, StoreModule.forRoot({}, {}), TranslateModule.forRoot(), NoopAnimationsModule],
      declarations: [HeaderComponent, UserMenuToggleComponent],
      providers: [provideMockStore({
        initialState : { user: { baseline: undefined, availableBaselines: [] } }
        }),
        TranslateService,
        { provide: DialogService, useValue: { open: () => Promise.resolve(dialogResult) } },
        { provide: BrandingService, useValue: { configData: { showLogos: true, flagSrc: 'flag.svg', flagAlt: { en: 'Our flag' } } } },
        provideRouter([]),
        provideZonelessChangeDetection()
      ]
    }).compileComponents();
    TestBed.inject(TranslateService).setDefaultLang('en');
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    component.title = 'Symphony'
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the flag alt text from the branding config', () => {
    expect(fixture.nativeElement.querySelector('img.flag').getAttribute('alt')).toBe('Our flag');
  });

  describe('with a header image per language', () => {
    let translate: TranslateService;
    const flag = (): HTMLImageElement | null => fixture.nativeElement.querySelector('img.flag');

    beforeEach(() => {
      translate = TestBed.inject(TranslateService);
      TestBed.inject(BrandingService).configData.flagSrc = { sv: 'flag-sv.svg', en: 'flag-en.svg' };
    });

    it('shows the header image for the current language', () => {
      translate.use('sv');
      fixture.detectChanges();
      expect(flag()?.getAttribute('src')).toBe('flag-sv.svg');
    });

    it('shows the English header image in French', () => {
      translate.use('fr');
      fixture.detectChanges();
      expect(flag()?.getAttribute('src')).toBe('flag-en.svg');
    });

    it('switches the header image when the language changes', async () => {
      translate.use('sv');
      fixture.detectChanges();
      expect(flag()?.getAttribute('src')).toBe('flag-sv.svg');

      translate.use('en');
      await fixture.whenStable();
      expect(flag()?.getAttribute('src')).toBe('flag-en.svg');
    });

    it('shows no header image when none resolves', () => {
      spyOn(console, 'error');
      TestBed.inject(BrandingService).configData.flagSrc = { sv: 'flag-sv.svg' };
      translate.use('fr');
      fixture.detectChanges();
      expect(flag()).toBeNull();
    });
  });

  describe('when the language dialog closes', () => {
    const isMenuOpen = () =>
      fixture.nativeElement.querySelector('.header-menu-container').classList.contains('is-open');

    const changeLanguage = async () => {
      await component.changeLanguage();
      await new Promise((resolve) => setTimeout(resolve));
      await fixture.whenStable();
    };

    beforeEach(async () => {
      fixture.nativeElement.querySelector('app-user-menu-toggle').click();
      await fixture.whenStable();
      expect(isMenuOpen()).toBeTrue();
    });

    it('closes the user menu after a language is chosen', async () => {
      dialogResult = 'en';
      await changeLanguage();
      expect(isMenuOpen()).toBeFalse();
    });

    it('closes the user menu after the dialog is cancelled', async () => {
      dialogResult = undefined;
      await changeLanguage();
      expect(isMenuOpen()).toBeFalse();
    });
  });

  it('offers About to logged-out visitors between language and log in', () => {
    expect(component.publicMenu!.map(item => item.name))
      .toEqual(['user-menu.change-language', 'user-menu.about', 'login.login']);
  });
});
