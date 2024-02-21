import { Component } from '@angular/core';
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from "@shared/dialog/dialog-config";
import { MatrixRef } from "@src/app/map-view/scenario/scenario-area-detail/matrix-selection/matrix.interfaces";
import { State } from "@src/app/app-reducer";
import { CalculationAreaSlice } from "@data/area/area.interfaces";
import { AreaSelectors } from "@data/area";

@Component({
  selector: 'app-set-arbitrary-matrix',
  templateUrl: './set-arbitrary-matrix.component.html',
  styleUrls: ['./set-arbitrary-matrix.component.scss']
})
export class SetArbitraryMatrixComponent {
  matrices: MatrixRef[];
  areaName!: string;
  percentileValue: number;
  selectedMatrix: MatrixRef | null = null;
  selectedCalculationArea: CalculationAreaSlice | null = null;
  calibratedAreas$: Observable<CalculationAreaSlice[]>;

  constructor( private dialog: DialogRef,
               private store: Store<State>,
               conf: DialogConfig ) {
    this.matrices = conf.data.matrices || [];
    this.areaName = conf.data.itemName;
    this.percentileValue = conf.data.percentileValue;
    this.calibratedAreas$ = this.store.select(AreaSelectors.selectCalibratedCalculationAreas);
    this.calibratedAreas$.subscribe((areas) => {
      if (areas.length > 0) {
        this.selectedCalculationArea = areas[0];
      }
    });
}

  close() {
    this.dialog.close(null);
  }

  confirm() {
    this.dialog.close([this.selectedMatrix, this.selectedCalculationArea!.id]);
  }
}
