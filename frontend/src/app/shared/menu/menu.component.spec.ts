import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MenuComponent } from './menu.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { provideMockStore } from "@ngrx/store/testing";
import { RouterModule } from "@angular/router";
import { provideZonelessChangeDetection } from "@angular/core";

describe('MenuComponent', () => {
  let fixture: ComponentFixture<MenuComponent>,
      component: MenuComponent

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        FontAwesomeModule,
        TranslationSetupModule
      ],
      declarations: [MenuComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideMockStore({ initialState : { user: {} } })
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
