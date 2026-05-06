import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { DialogConfig } from '@shared/dialog/dialog-config';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { TranslateService } from '@ngx-translate/core';

export interface ModelDescriptionDialogData {
  titleTranslationKey: string;
  steps: Array<{
    name: string;
    translationKey: string;
    formulaInputs: Array<{
      name: string;
      displayName: string;
    }>;
    normalization: string;
    operation: string;
    hasStepsAsInput: boolean;
    output: boolean;
  }>;
}

type FormulaToken =
  | { type: 'text', value: string }
  | { type: 'step', value: string, stepNumber: number };

interface RenderedStep {
  number: number;
  name: string;
  translationKey: string;
  formulaInputs: Array<{
    name: string;
    displayName: string;
  }>;
  normalization: string;
  operation: string;
  hasStepsAsInput: boolean;
  output: boolean;
  isPartOfOutput: boolean;
  formulaTokens: FormulaToken[];
}

@Component({
  selector: 'app-model-description-dialog',
  templateUrl: './summary-model-dialog.component.html',
  styleUrls: ['./summary-model-dialog.component.scss'],
  standalone: false,
})
export class SummaryModelDialogComponent {

  titleTranslationKey: string = '';
  steps: RenderedStep[] = [];
  private highlightedStep: number | null = null;
  private highlightTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly config = inject(DialogConfig) as { data: ModelDescriptionDialogData };
  private readonly dialogRef = inject(DialogRef);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef)

  constructor() {
    const payload = this.config.data;
    this.titleTranslationKey = payload.titleTranslationKey;

    const nameToNumber = new Map<string, number>();
    payload.steps.forEach((step, index) => {
      nameToNumber.set(step.name, index + 1);
    });

    let outputStepIndex = -1;
    for (let i = payload.steps.length - 1; i >= 0; i--) {
      if (payload.steps[i].output) {
        outputStepIndex = i;
        break;
      }
    }

    const outputDependencies = new Set<number>();
    if (outputStepIndex !== -1) {
      const outputStep = payload.steps[outputStepIndex];
      outputStep.formulaInputs?.forEach(input => {
        const num = nameToNumber.get(input.name);
        if (num) outputDependencies.add(num);
      });
    }

    this.steps = payload.steps.map((step, index) => {
      const isPartOfOutput = outputDependencies.has(index + 1);

      return {
        number: index + 1,
        name: step.name,
        translationKey: step.translationKey,
        formulaInputs: step.formulaInputs,
        normalization: step.normalization,
        operation: step.operation,
        hasStepsAsInput: step.hasStepsAsInput,
        output: step.output,
        isPartOfOutput,
        formulaTokens: this.buildFormulaTokens(step, nameToNumber)
      };
    });
  }

  private buildFormulaTokens(
    step: ModelDescriptionDialogData['steps'][0],
    nameToNumber: Map<string, number>
  ): FormulaToken[] {
    const tokens: FormulaToken[] = [];

    const name = this.getStepDisplayName(step);
    const operation = this.translate.instant(`map.summary-model.operation.${step.operation}`);
    tokens.push({ type: 'text', value: `${name} = ${operation}(` });

    (step.formulaInputs || []).forEach((input, index, arr) => {
      const stepNumber = nameToNumber.get(input.name);

      if (step.hasStepsAsInput && stepNumber) {
        tokens.push({
          type: 'step',
          value: this.translate.instant(input.displayName),
          stepNumber
        });
      } else {
        tokens.push({
          type: 'text',
          value: input.displayName
        });
      }

      if (index < arr.length - 1) {
        tokens.push({ type: 'text', value: ', ' });
      }
    });

    tokens.push({ type: 'text', value: ')' });

    return tokens;
  }

  private getStepDisplayName(step: { name: string, translationKey: string }): string {
    return step.translationKey
      ? this.translate.instant(step.translationKey)
      : step.name;
  }

  scrollToStep(stepNumber: number) {
    const el = document.getElementById(`step-${stepNumber}`);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (this.highlightTimeout) {
      clearTimeout(this.highlightTimeout);
    }

    this.highlightedStep = stepNumber;
    this.cdr.markForCheck();

    requestAnimationFrame(() => {
      this.highlightTimeout = setTimeout(() => {
        this.highlightedStep = null;
        this.cdr.markForCheck();
      }, 2000);
    });
  }

  close() {
    this.dialogRef.close();
  }
}
