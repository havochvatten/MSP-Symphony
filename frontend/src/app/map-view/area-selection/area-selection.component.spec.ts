import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AreaSelectionComponent } from './area-selection.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { SharedModule } from '@src/app/shared/shared.module';
import { provideMockStore } from '@ngrx/store/testing';
import { SelectionLayoutComponent } from '../selection-layout/selection-layout.component';
import { AreaGroupComponent } from './area-group/area-group.component';
import { initialState as area } from "@data/area/area.reducers";

describe('AreaSelectionComponent', () => {
  let fixture: ComponentFixture<AreaSelectionComponent>,
      component: AreaSelectionComponent;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AreaSelectionComponent,
        SelectionLayoutComponent,
        AreaGroupComponent
      ],
      imports: [SharedModule, TranslationSetupModule],
      providers: [provideMockStore({
        initialState: {
          area : area
        }
      })]
    }).compileComponents();
    fixture = TestBed.createComponent(AreaSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
