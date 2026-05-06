import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideZonelessChangeDetection } from '@angular/core';

import { SummaryModelAccordionComponent } from './summary-model-accordion.component';

describe('SummaryModelAccordionComponent', () => {
  let fixture: ComponentFixture<SummaryModelAccordionComponent>;
  let component: SummaryModelAccordionComponent;

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
      declarations: [SummaryModelAccordionComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryModelAccordionComponent);
    component = fixture.componentInstance;
    component.isSummaryModelLoaded = () => true;
    component.isSummaryModelSelected = () => false;
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
});
