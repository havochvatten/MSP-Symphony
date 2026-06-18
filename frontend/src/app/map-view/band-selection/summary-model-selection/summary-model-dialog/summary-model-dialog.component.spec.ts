import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideZonelessChangeDetection } from '@angular/core';

import {
  ModelDescriptionDialogData,
  SummaryModelDialogComponent
} from './summary-model-dialog.component';
import { DialogConfig } from '@shared/dialog/dialog-config';
import { DialogRef } from '@shared/dialog/dialog-ref';

const SIMPLE_DATA: ModelDescriptionDialogData = {
  title: 'Test title',
  steps: [
    {
      name: 'A',
      label: 'Step A',
      formulaInputs: [{ name: '', displayName: 'Band A' }],
      normalization: '0-100',
      operation: 'mean',
      hasStepsAsInput: false,
      output: false
    },
    {
      name: 'B',
      label: 'Step B',
      formulaInputs: [{ name: 'A', displayName: 'Step A' }],
      normalization: '',
      operation: 'mean',
      hasStepsAsInput: true,
      output: true
    }
  ]
};

describe('SummaryModelDialogComponent', () => {
  let fixture: ComponentFixture<SummaryModelDialogComponent>;
  let component: SummaryModelDialogComponent;

  beforeEach(() => {
    const dialogConfig = new DialogConfig();
    dialogConfig.data = SIMPLE_DATA;

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        TranslateService,
        { provide: DialogConfig, useValue: dialogConfig },
        { provide: DialogRef, useValue: new DialogRef() },
        provideZonelessChangeDetection()
      ],
      declarations: [SummaryModelDialogComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryModelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('title is set from dialog data', () => {
    expect(component.title).toBe('Test title');
  });

  it('renders one RenderedStep per input step', () => {
    expect(component.steps.length).toBe(SIMPLE_DATA.steps.length);
  });

  it('marks the output step with isOutput=true', () => {
    const outputStep = component.steps.find((s) => s.output);
    expect(outputStep).toBeTruthy();
    expect(outputStep!.name).toBe('B');
  });

  it('step numbers are 1-based and sequential', () => {
    expect(component.steps[0].number).toBe(1);
    expect(component.steps[1].number).toBe(2);
  });

  it('isPartOfOutput marks direct inputs to the output step', () => {
    // Step A (index 0) is an input to step B (output)
    const stepA = component.steps.find((s) => s.name === 'A');
    expect(stepA!.isPartOfOutput).toBeTrue();
  });
});
