import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CalculationHistoryComponent } from './calculation-history.component';
import { provideMockStore } from '@ngrx/store/testing';
import { initialState as metadata } from '@data/metadata/metadata.reducers';
import { initialState as calculation } from '@data/calculation/calculation.reducers';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { IconComponent } from "@shared/icon/icon.component";

describe('CalculationHistoryComponent', () => {
  let fixture: ComponentFixture<CalculationHistoryComponent>,
      component: CalculationHistoryComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CalculationHistoryComponent, IconComponent],
      imports: [TranslationSetupModule],
      providers: [
        provideMockStore({
          initialState: {
            metadata: metadata,
            calculation: calculation,
            user: { baseline: undefined }
          }
        })
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CalculationHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
