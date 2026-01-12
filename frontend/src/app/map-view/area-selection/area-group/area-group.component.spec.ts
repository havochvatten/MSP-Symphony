import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@shared/shared.module';

import { AreaGroupComponent } from './area-group.component';
import { TranslationSetupModule } from "@src/app/app-translation-setup.module";
import { provideMockStore } from "@ngrx/store/testing";
import { provideZonelessChangeDetection } from "@angular/core";

describe('AreaGroupComponent', () => {
  let fixture: ComponentFixture<AreaGroupComponent>,
      component: AreaGroupComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ AreaGroupComponent ],
      imports: [ SharedModule, TranslationSetupModule ],
      providers: [
        provideMockStore({ initialState : { user: {} } }),
        provideZonelessChangeDetection()
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(AreaGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
