import { Component, inject } from '@angular/core';
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
  styleUrls: ['./set-arbitrary-matrix.component.scss'],
  standalone: false
})
export class SetArbitraryMatrixComponent {
  private dialog = inject(DialogRef);
  private store = inject<Store<State>>(Store);

  matrices: MatrixRef[];
  areaName!: string;
  selectedMatrix: MatrixRef | null = null;
  selectedCalculationArea: CalculationAreaSlice | null = null;
  calibratedAreas$: Observable<CalculationAreaSlice[]>;

  constructor() {
    const conf = inject(DialogConfig);

    this.matrices = conf.data.matrices || [];
    this.areaName = conf.data.areaName;
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
