import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectionLayoutComponent } from './selection-layout.component';
import { SharedModule } from '@shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { provideMockStore } from "@ngrx/store/testing";

describe('SelectionLayoutComponent', () => {
  let fixture: ComponentFixture<SelectionLayoutComponent>,
      component: SelectionLayoutComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SelectionLayoutComponent],
      imports: [SharedModule, TranslationSetupModule],
      providers: [provideMockStore({
        initialState : { user: {} }
      })]
    }).compileComponents();
    fixture = TestBed.createComponent(SelectionLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
