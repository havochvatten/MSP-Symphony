import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

import { MultiToolsComponent } from './multi-tools.component';
import { signal } from "@angular/core";
import { provideMockStore } from "@ngrx/store/testing";

describe('MultiToolsComponent', () => {
  let component: MultiToolsComponent;
  let fixture: ComponentFixture<MultiToolsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslationSetupModule],
      declarations: [MultiToolsComponent],
      providers: [provideMockStore({ initialState : { user: {} } })]
    });
    fixture = TestBed.createComponent(MultiToolsComponent);
    component = fixture.componentInstance;
    component.isMultiMode = signal(false);
    component.disabledPredicate = () => false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
