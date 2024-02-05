import { Component, NgModuleRef } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { Store } from '@ngrx/store';
import { Observable } from "rxjs";

import { BatchCalculationProcessEntry } from "@data/calculation/calculation.interfaces";
import { CalculationActions, CalculationSelectors } from "@data/calculation";
import { MessageActions } from "@data/message";
import { ScenarioSelectors } from "@data/scenario";
import { State } from "@src/app/app-reducer";
import { BatchStatusService } from "@src/app/socket/batch-status.service";
import { CalculationReportModalComponent } from "@shared/report-modal/calculation-report-modal.component";
import { DialogService } from "@shared/dialog/dialog.service";

@Component({
  selector: 'app-batch-progress-display',
  templateUrl: './batch-progress.component.html',
  styleUrls: ['./batch-progress.component.scss']
})
export class BatchProgressComponent {

  processes$: Observable<BatchCalculationProcessEntry[]>;

  constructor(private store : Store<State>,
              private batchStatusService: BatchStatusService,
              private dialogService: DialogService,
              private translateService: TranslateService,
              private moduleRef: NgModuleRef<never>) {
    this.processes$ = this.store.select(CalculationSelectors.selectBatchProcesses);
    this.processes$.subscribe(processes => {
        for(const bcp of processes) {
            if(bcp) {
                if (bcp.currentEntity === null && bcp.calculated.length + bcp.failed.length === 0) {
                    this.batchStatusService.connect(bcp.id)
                }
            }
        }
    });
  }

  showReport(report: number|null) {
    if(report) { // 'rigorous' null check for correctness, should be redundant in practice
      this.dialogService.open(CalculationReportModalComponent, this.moduleRef, {
        data: { id: report }
      });
    }
  }

  checkCompleted(process: BatchCalculationProcessEntry): boolean {
    return process.calculated.length + process.failed.length === process.entities.length;
  }

  removeFinishedProcess(id: number) {
    this.store.dispatch(CalculationActions.removeFinishedBatchProcess({ id }));
  }

  cancelRunningProcess(id: number) {
    this.store.dispatch(CalculationActions.cancelBatchProcess({ id }));
    this.store.dispatch(MessageActions.addPopupMessage({
      message: {
        type: 'INFO',
        title: this.translateService.instant('map.batch-progress.cancelled-run.title'),
        message: this.translateService.instant('map.batch-progress.cancelled-run.message'),
        uuid: `cancelled-run--${id}`
      }
    }));
  }
}
