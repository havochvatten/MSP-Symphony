import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpactTableComponent } from './impact-table.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { provideMockStore } from "@ngrx/store/testing";
import { provideZonelessChangeDetection } from "@angular/core";

describe('ImpactTableComponent', () => {
  let fixture: ComponentFixture<ImpactTableComponent>,
      component: ImpactTableComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImpactTableComponent],
      imports: [TranslationSetupModule],
      providers: [
        provideZonelessChangeDetection(),
        provideMockStore({ initialState : { user: {} } })
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ImpactTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
