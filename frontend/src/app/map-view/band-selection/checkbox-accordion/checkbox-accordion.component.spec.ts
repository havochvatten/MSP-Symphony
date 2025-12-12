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
import { provideZonelessChangeDetection } from "@angular/core";

describe('CheckboxAccordionComponent', () => {
  let fixture: ComponentFixture<CheckboxAccordionComponent>,
      component: CheckboxAccordionComponent;

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
        IconComponent
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CheckboxAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
