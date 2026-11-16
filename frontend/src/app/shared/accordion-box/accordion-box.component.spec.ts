import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AccordionBoxComponent } from './accordion-box.component';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { IconComponent } from '../icon/icon.component';
import { provideZonelessChangeDetection } from '@angular/core';

describe('AccordionBoxComponent', () => {
  let fixture: ComponentFixture<AccordionBoxComponent>,
    component: AccordionBoxComponent,
    el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [TranslateService, provideZonelessChangeDetection()],
      declarations: [AccordionBoxComponent, IconButtonComponent, IconComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccordionBoxComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('is not marked by default, so other users of the box look as before', () => {
    expect(el.querySelector('article')!.getAttribute('data-marked')).toBe('false');
  });

  it('is marked when asked', async () => {
    fixture.componentRef.setInput('marked', true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(el.querySelector('article')!.getAttribute('data-marked')).toBe('true');
  });
});
