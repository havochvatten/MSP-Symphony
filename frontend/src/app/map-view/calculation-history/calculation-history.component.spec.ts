import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CalculationHistoryComponent } from './calculation-history.component';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

function setUp() {
  const fixture: ComponentFixture<CalculationHistoryComponent> = TestBed.createComponent(
    CalculationHistoryComponent
  );
  const component: CalculationHistoryComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('CalculationHistoryComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CalculationHistoryComponent],
      imports: [TranslationSetupModule],
      providers: [
        provideMockStore({
          initialState: {
            calculation: {
              calculations: []
            },
            metadata: {},
            area: {}
          }
        })
      ]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
