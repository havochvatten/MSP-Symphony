import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedModule } from '@shared/shared.module';

import { AreaGroupComponent } from './area-group.component';
import { TranslationSetupModule } from "@src/app/app-translation-setup.module";
import { provideMockStore } from "@ngrx/store/testing";

describe('AreaGroupComponent', () => {
  let fixture: ComponentFixture<AreaGroupComponent>,
      component: AreaGroupComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AreaGroupComponent ],
      imports: [ SharedModule, TranslationSetupModule ],
      providers: [provideMockStore({ initialState : { user: {} } })]
    }).compileComponents();
    fixture = TestBed.createComponent(AreaGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
