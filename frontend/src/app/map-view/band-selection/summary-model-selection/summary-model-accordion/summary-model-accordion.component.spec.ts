import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';

import { SummaryModelAccordionComponent } from './summary-model-accordion.component';
import {
  AccordionBoxComponent,
  AccordionBoxContentComponent,
  AccordionBoxHeaderComponent
} from '@shared/accordion-box/accordion-box.component';
import { IconButtonComponent } from '@shared/icon-button/icon-button.component';
import { IconComponent } from '@shared/icon/icon.component';
import { OnMapNamesComponent } from '../../on-map-names/on-map-names.component';

describe('SummaryModelAccordionComponent', () => {
  let fixture: ComponentFixture<SummaryModelAccordionComponent>;
  let component: SummaryModelAccordionComponent;
  let el: HTMLElement;

  const names = () =>
    fixture.debugElement.query(By.directive(OnMapNamesComponent))?.componentInstance.names;
  const marked = () => el.querySelector('article')!.getAttribute('data-marked');

  // Opens Överblick the way a user does. Calling toggle() directly would not
  // mark the zoneless view for checking.
  const clickChevron = () => {
    (el.querySelector('app-icon-button button') as HTMLElement).click();
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatCheckboxModule
      ],
      providers: [
        TranslateService,
        provideZonelessChangeDetection()
      ],
      declarations: [
        SummaryModelAccordionComponent,
        AccordionBoxComponent,
        AccordionBoxHeaderComponent,
        AccordionBoxContentComponent,
        IconButtonComponent,
        IconComponent,
        OnMapNamesComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryModelAccordionComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    component.rows = [
      { model: 'simple', label: 'Simple' },
      { model: 'balanced', label: 'Balanced' }
    ];
    component.isSummaryModelLoaded = () => true;
    component.isSummaryModelSelected = (model) => model === 'balanced';
    component.toggleSummaryModel = () => {};
    component.modelCategory = 'ECOSYSTEM';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('open starts false and toggle flips it', () => {
    expect(component.open).toBeFalse();
    component.toggle();
    expect(component.open).toBeTrue();
    component.toggle();
    expect(component.open).toBeFalse();
  });

  it('marks Överblick and lists the model on the map when collapsed', () => {
    expect(marked()).toBe('true');
    expect(names()).toEqual(['Balanced']);
  });

  it('keeps the bar but drops the names when open', () => {
    clickChevron();
    expect(component.open).toBeTrue();
    expect(marked()).toBe('true');
    expect(names()).toBeUndefined();
  });

  it('leaves Överblick unmarked when no model is on the map', () => {
    fixture.componentRef.setInput('isSummaryModelSelected', () => false);
    fixture.detectChanges();
    expect(marked()).toBe('false');
    expect(names()).toBeUndefined();
  });

  it('marks the row of the model on the map and keeps names out of the checkbox label', () => {
    const rows = el.querySelectorAll('li.list-item');
    expect(rows[0].classList).not.toContain('on-map');
    expect(rows[1].classList).toContain('on-map');
    expect(el.querySelector('mat-checkbox app-on-map-names')).toBeNull();
  });
});
