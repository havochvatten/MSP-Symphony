import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckboxAccordionComponent } from './checkbox-accordion.component';
import {
  AccordionBoxComponent,
  AccordionBoxHeaderComponent,
  AccordionBoxContentComponent
} from '@shared/accordion-box/accordion-box.component';
import { IconButtonComponent } from '@shared/icon-button/icon-button.component';
import { IconComponent } from '@shared/icon/icon.component';
import { StoreModule } from "@ngrx/store";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState as scenario } from '@data/scenario/scenario.reducers';
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, provideZonelessChangeDetection } from "@angular/core";
import { By } from '@angular/platform-browser';
import { Band } from '@data/metadata/metadata.interfaces';
import { OnMapNamesComponent } from '../on-map-names/on-map-names.component';

// Stands in for the real row so the spec needs no metadata store. The custom
// elements schema alone won't do: Angular rejects the [onSelect] binding on an
// unknown element.
@Component({ selector: 'app-slider-controls', template: '', standalone: false })
class SliderControlsStubComponent {
  @Input() band?: Band;
  @Input() category?: string;
  @Input() disabled?: boolean;
  @Input() onSelect?: unknown;
  @Input() onChangeVisible?: unknown;
  @Input() onChangeVisibleReliability?: unknown;
}

describe('CheckboxAccordionComponent', () => {
  let fixture: ComponentFixture<CheckboxAccordionComponent>,
      component: CheckboxAccordionComponent,
      el: HTMLElement;

  const band = (title: string, bandNumber: number, visible = false, loaded = true): Band => ({
    title,
    bandNumber,
    symphonyCategory: 'ECOSYSTEM',
    selected: false,
    reliability: null,
    meta: {},
    visible,
    loaded
  });

  const render = (inputs: { title?: string, bands?: Band[], searching?: boolean }) => {
    Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
    fixture.detectChanges();
  };

  const names = () =>
    fixture.debugElement.query(By.directive(OnMapNamesComponent))?.componentInstance.names;
  const marked = () => el.querySelector('article')!.getAttribute('data-marked');

  // Opens the category the way a user does. Calling toggle() directly would
  // not mark the zoneless view for checking.
  const clickChevron = () => {
    (el.querySelector('app-icon-button button') as HTMLElement).click();
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({},{}),
        TranslateModule.forRoot()
      ],
      providers: [
        TranslateService,
        provideMockStore({
          initialState: { scenario: scenario }
        }),
        provideZonelessChangeDetection()
      ],
      declarations: [
        CheckboxAccordionComponent,
        AccordionBoxComponent,
        AccordionBoxHeaderComponent,
        AccordionBoxContentComponent,
        IconButtonComponent,
        IconComponent,
        OnMapNamesComponent,
        SliderControlsStubComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(CheckboxAccordionComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('marks a collapsed category with a layer on the map and lists it on first render', () => {
    render({ title: 'Däggdjur', bands: [band('Gråsäl', 1, true), band('Knubbsäl', 2)] });
    expect(marked()).toBe('true');
    expect(names()).toEqual(['Gråsäl']);
  });

  it('follows layers turned on and off after the first render', () => {
    render({ title: 'Däggdjur', bands: [band('Gråsäl', 1, true), band('Knubbsäl', 2)] });
    render({ bands: [band('Gråsäl', 1), band('Knubbsäl', 2, true)] });
    expect(marked()).toBe('true');
    expect(names()).toEqual(['Knubbsäl']);
    render({ bands: [band('Gråsäl', 1), band('Knubbsäl', 2)] });
    expect(marked()).toBe('false');
    expect(names()).toBeUndefined();
  });

  it('counts a layer that is still loading', () => {
    render({ title: 'Däggdjur', bands: [band('Gråsäl', 1, true, false)] });
    expect(marked()).toBe('true');
    expect(names()).toEqual(['Gråsäl']);
  });

  it('leaves a category with nothing on the map unmarked and without names', () => {
    render({ title: 'Fisk', bands: [band('Torsk', 3)] });
    expect(marked()).toBe('false');
    expect(names()).toBeUndefined();
  });

  it('only considers the bands it is given, so a search-filtered layer does not count', () => {
    render({ title: 'Däggdjur', bands: [band('Knubbsäl', 2)], searching: true });
    expect(marked()).toBe('false');
  });

  it('keeps the bar but drops the names when the category is open', () => {
    render({ title: 'Däggdjur', bands: [band('Gråsäl', 1, true)] });
    clickChevron();
    expect(component.expanded).toBeTrue();
    expect(marked()).toBe('true');
    expect(names()).toBeUndefined();
  });

  it('drops the names while searching, since the category is forced open', () => {
    render({ title: 'Däggdjur', bands: [band('Gråsäl', 1, true)], searching: true });
    expect(component.expanded).toBeTrue();
    expect(names()).toBeUndefined();
  });

  it('marks the row of a layer that is on the map', () => {
    render({ title: 'Däggdjur', bands: [band('Gråsäl', 1, true), band('Knubbsäl', 2)] });
    const rows = el.querySelectorAll('li.list-item');
    expect(rows[0].classList).toContain('on-map');
    expect(rows[1].classList).not.toContain('on-map');
  });

  it('keeps the names outside the checkbox label', () => {
    render({ title: 'Däggdjur', bands: [band('Gråsäl', 1, true)] });
    expect(el.querySelector('app-on-map-names')).not.toBeNull();
    expect(el.querySelector('mat-checkbox app-on-map-names')).toBeNull();
  });
});
