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

describe('CheckboxAccordionComponent', () => {
  let fixture: ComponentFixture<CheckboxAccordionComponent>,
      component: CheckboxAccordionComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({},{})
      ],
      declarations: [
        CheckboxAccordionComponent,
        AccordionBoxComponent,
        AccordionBoxHeaderComponent,
        AccordionBoxContentComponent,
        IconButtonComponent,
        IconComponent
      ],
      providers: [provideMockStore({
        initialState: { scenario: scenario }
      })]
    }).compileComponents();
    fixture = TestBed.createComponent(CheckboxAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
