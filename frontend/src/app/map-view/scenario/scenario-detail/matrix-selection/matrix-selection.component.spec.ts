import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { SharedModule } from '@shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { initialState as area } from '@data/area/area.reducers';
import { initialState as scenario } from '@data/scenario/scenario.reducers';
import { MatrixSelectionComponent } from './matrix-selection.component';
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";

describe('MatrixSelectionComponent', () => {
  let component: MatrixSelectionComponent;
  let fixture: ComponentFixture<MatrixSelectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslationSetupModule,
        MatRadioModule,
        MatSelectModule
      ],
      declarations: [MatrixSelectionComponent],
      providers: [provideMockStore(
        { initialState: {
          metadata: metadata,
          area: area,
          scenario: scenario,
          user: { baseline: undefined }
        }})
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(MatrixSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    ;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
