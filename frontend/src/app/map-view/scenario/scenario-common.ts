import { ConfirmationModalComponent } from "@shared/confirmation-modal/confirmation-modal.component";
import { ScenarioActions } from "@data/scenario";
import { DialogService } from "@shared/dialog/dialog.service";
import { NgModuleRef } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { Scenario, ScenarioArea, ScenarioChangesSelection } from "@data/scenario/scenario.interfaces";
import { State } from "@src/app/app-reducer";
import { TransferChangesComponent } from "@src/app/map-view/scenario/transfer-changes/transfer-changes.component";

export async function deleteScenario(
  dialogService:DialogService, translateService: TranslateService, store:Store<State>, moduleRef:NgModuleRef<any>, scenario: Scenario):Promise<void> {
  const confirmDelete = await dialogService.open<boolean>(
    ConfirmationModalComponent, moduleRef,
    {
      data: {
        header: `${translateService.instant('map.editor.delete.modal.title', { scenario: scenario.name })}`,
        confirmText: translateService.instant('map.editor.delete.modal.delete'),
        confirmColor: 'warn',
        dialogClass: 'center'
      }
    });
  if (confirmDelete) {
    store.dispatch(ScenarioActions.deleteScenario({
      scenarioToBeDeleted: scenario
    }));
  }
}

function isScenario(target: Scenario | ScenarioArea): target is Scenario {
  return (target as Scenario).areas !== undefined;
}

export async function transferChanges(
  dialogService:DialogService, translateService: TranslateService, store: Store<State>, moduleRef:NgModuleRef<any>, target: Scenario | ScenarioArea):Promise<boolean> {
  const selectedChanges = await dialogService.open<ScenarioChangesSelection>(
    TransferChangesComponent, moduleRef,
    {
      data: {
        target: target,
      }
    });
  if (selectedChanges) {
    if(isScenario(target)) {
      store.dispatch(ScenarioActions.transferScenarioChanges({ changesSelection: selectedChanges }));
    } else {
      store.dispatch(ScenarioActions.transferScenarioAreaChanges({ changesSelection: selectedChanges }));
    }
    return true;
  }
  return false;
}
