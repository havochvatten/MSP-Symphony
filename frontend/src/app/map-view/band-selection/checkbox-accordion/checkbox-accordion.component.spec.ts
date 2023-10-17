import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

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

describe('CheckboxAccordionComponent', () => {
  let fixture: ComponentFixture<CheckboxAccordionComponent>,
      component: CheckboxAccordionComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({},{}),
        TranslateModule.forRoot()
      ],
      providers: [
        TranslateService,
        provideMockStore({
          initialState: { scenario: scenario }
        })],
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
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
