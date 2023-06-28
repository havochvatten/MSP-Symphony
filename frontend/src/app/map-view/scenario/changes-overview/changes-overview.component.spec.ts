import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangesOverviewComponent } from './changes-overview.component';
import { DialogService } from "@shared/dialog/dialog.service";
import { DialogRef } from "@shared/dialog/dialog-ref";
import { DialogConfig } from '@shared/dialog/dialog-config';
import { StoreModule } from "@ngrx/store";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState as scenario } from "@data/scenario/scenario.reducers";
import { initialState as metadata } from '@data/metadata/metadata.reducers';

describe('ChangesOverviewComponent', () => {
  let component: ChangesOverviewComponent;
  let fixture: ComponentFixture<ChangesOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({},{}),
        TranslateModule.forRoot()
      ],
      declarations: [ ChangesOverviewComponent ],
      providers:  [
        DialogService,
        DialogRef,
        TranslateService,
        {
          provide: DialogConfig,
          useValue: {
            data: {
              scenario: {}
            }
          }
        },
        provideMockStore({
          initialState: {
            scenario: scenario,
            metadata: metadata
          }
        })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangesOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
