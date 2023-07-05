import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ToolbarButtonComponent } from './toolbar-button.component';
import { SharedModule } from '@shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { provideMockStore } from "@ngrx/store/testing";
import { initialState as scenario } from "@data/scenario/scenario.reducers";
import { StoreModule } from "@ngrx/store";

describe('ToolbarButtonComponent', () => {
  let fixture: ComponentFixture<ToolbarButtonComponent>,
      component: ToolbarButtonComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslationSetupModule,
        StoreModule.forRoot({}, {})
      ],
      providers: [
        provideMockStore({
          initialState:{
            scenario: scenario,
            user: { baseline: undefined }
          }
        })
      ],
      declarations: [ToolbarButtonComponent]
    }).compileComponents()
    fixture = TestBed.createComponent(ToolbarButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
