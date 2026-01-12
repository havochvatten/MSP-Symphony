import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

import { MultiToolsComponent } from './multi-tools.component';
import { provideZonelessChangeDetection, signal } from "@angular/core";
import { provideMockStore } from "@ngrx/store/testing";
import { MatFormFieldModule } from "@angular/material/form-field";
import { IconButtonComponent } from "@shared/icon-button/icon-button.component";
import { IconComponent } from "@shared/icon/icon.component";

describe('MultiToolsComponent', () => {
  let component: MultiToolsComponent;
  let fixture: ComponentFixture<MultiToolsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslationSetupModule,
        MatFormFieldModule
      ],
      declarations: [
        MultiToolsComponent,
        IconComponent,
        IconButtonComponent
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideMockStore({ initialState : { user: {} } })
      ]
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
