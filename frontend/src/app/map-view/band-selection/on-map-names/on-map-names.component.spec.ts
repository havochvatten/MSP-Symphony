import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { OnMapNamesComponent } from './on-map-names.component';

describe('OnMapNamesComponent', () => {
  let fixture: ComponentFixture<OnMapNamesComponent>;
  let el: HTMLElement;

  const text = (selector: string) => el.querySelector(selector)?.textContent?.trim();

  const render = async (names: string[]) => {
    fixture.componentRef.setInput('names', names);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection()],
      declarations: [OnMapNamesComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('sv', { map: { 'on-map': { more: '+{{count}} till' } } });
    translate.use('sv');

    fixture = TestBed.createComponent(OnMapNamesComponent);
    el = fixture.nativeElement;
  });

  it('shows every name when there are three or fewer', async () => {
    await render(['Torsk', 'Skarpsill', 'Strömming']);
    expect(text('.names-text')).toBe('Torsk, Skarpsill, Strömming');
    expect(el.querySelector('.more')).toBeNull();
  });

  it('shows the first three in list order and counts the rest', async () => {
    await render(['Torsk', 'Skarpsill', 'Strömming', 'Gädda', 'Abborre', 'Piggvar', 'Rödspotta']);
    expect(text('.names-text')).toBe('Torsk, Skarpsill, Strömming');
    expect(text('.more')).toBe('+4 till');
  });

  it('puts the full list in the tooltip', async () => {
    await render(['Torsk', 'Skarpsill', 'Strömming', 'Gädda']);
    expect(el.getAttribute('title')).toBe('Torsk, Skarpsill, Strömming, Gädda');
  });

  it('starts with an eye icon', async () => {
    await render(['Gråsäl']);
    expect(el.querySelector('app-icon')?.getAttribute('icontype')).toBe('eye');
  });
});
