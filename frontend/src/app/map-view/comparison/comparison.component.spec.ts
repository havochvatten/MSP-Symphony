import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { ComparisonComponent } from "@src/app/map-view/comparison/comparison.component";
import { StoreModule } from "@ngrx/store";
import { HttpClientModule } from "@angular/common/http";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { FormBuilder } from "@angular/forms";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { initialState as scenario } from '@data/scenario/scenario.reducers';
import { initialState as calculation } from '@data/calculation/calculation.reducers';
import { initialState as user } from '@data/user/user.reducers';
import { MatLegacyRadioButton as MatRadioButton, MatLegacyRadioGroup as MatRadioGroup, MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";

describe('ComparisonComponent', () => {
  let fixture: ComponentFixture<ComparisonComponent>,
      component: ComparisonComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatSelectModule,
        MatRadioModule,
        HttpClientModule,
        StoreModule.forRoot({},{}),
        TranslateModule.forRoot()
      ],
      providers: [
        TranslateService,
        FormBuilder,
        provideMockStore({
          initialState: {
            metadata: metadata,
            scenario: scenario,
            calculation: calculation,
            user: user
          }
        })
      ],
      declarations: [
        ComparisonComponent,
        MatRadioGroup,
        MatRadioButton
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ComparisonComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
