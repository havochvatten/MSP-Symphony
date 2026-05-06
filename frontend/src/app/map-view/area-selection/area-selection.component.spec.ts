import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AreaSelectionComponent } from './area-selection.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { SharedModule } from '@shared/shared.module';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { SelectionLayoutComponent } from '../selection-layout/selection-layout.component';
import { AreaGroupComponent, EditAreaComponent } from './area-group/area-group.component';
import { initialState as area } from "@data/area/area.reducers";
import { AreaActions } from '@data/area';
import { MoveAreaModalComponent } from '../move-area-modal/move-area-modal.component';
import { FormsModule } from '@angular/forms';

describe('AreaSelectionComponent', () => {
  let fixture: ComponentFixture<AreaSelectionComponent>,
      component: AreaSelectionComponent,
      store: MockStore;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AreaSelectionComponent,
        SelectionLayoutComponent,
        AreaGroupComponent,
        EditAreaComponent,
        MoveAreaModalComponent
      ],
      imports: [SharedModule, TranslationSetupModule, FormsModule],
      providers: [provideMockStore({
        initialState: {
          area : area,
          user : {}
        }
      })]
    }).compileComponents();
    store = TestBed.inject(MockStore)
    fixture = TestBed.createComponent(AreaSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
   it('should dispatch fetchUserDefinedAreas on init', () => {
    const dispatchSpy = spyOn(store, 'dispatch');
    component.ngOnInit();
    expect(dispatchSpy).toHaveBeenCalledWith(AreaActions.fetchUserDefinedAreas());
  });

  it('should dispatch deleteUserAreaCategory when deleteUserAreaCategory is called', async () => {
    const dispatchSpy = spyOn(store, 'dispatch');
    spyOn(component['dialogService'], 'open').and.returnValue(Promise.resolve(true));
    await component.deleteUserAreaCategory(1);
    expect(dispatchSpy).toHaveBeenCalledWith(
      AreaActions.deleteUserAreaCategory({ categoryId: 1 })
    );
  });

  it('should dispatch deleteAreasByCategory when categoryId is not null', () => {
    const dispatchSpy = spyOn(store, 'dispatch');
    spyOn(component['dialogService'], 'open').and.returnValue(Promise.resolve(true));
    component.deleteAreasByCategory(1);
    expect(dispatchSpy).toBeDefined();
  });

  it('should dispatch deleteUncategorizedAreas when categoryId is null', () => {
    const dispatchSpy = spyOn(store, 'dispatch');
    spyOn(component['dialogService'], 'open').and.returnValue(Promise.resolve(true));
    component.deleteAreasByCategory(null as any);
    expect(dispatchSpy).toBeDefined();
  });
});
