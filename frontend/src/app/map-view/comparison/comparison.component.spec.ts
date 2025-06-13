import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { ComparisonComponent } from "@src/app/map-view/comparison/comparison.component";
import { StoreModule } from "@ngrx/store";
import { HttpClientModule } from "@angular/common/http";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { FormBuilder } from "@angular/forms";
import { MatSelectModule } from "@angular/material/select";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { initialState as scenario } from '@data/scenario/scenario.reducers';
import { initialState as calculation } from '@data/calculation/calculation.reducers';
import { initialState as user } from '@data/user/user.reducers';
import { MatRadioModule } from "@angular/material/radio";
import { MatCheckboxModule } from "@angular/material/checkbox";

describe('ComparisonComponent', () => {
  let fixture: ComponentFixture<ComparisonComponent>,
      component: ComparisonComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatSelectModule,
        MatRadioModule,
        MatCheckboxModule,
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
        ComparisonComponent
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ComparisonComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
