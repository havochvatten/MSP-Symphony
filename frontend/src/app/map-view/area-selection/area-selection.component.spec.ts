import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AreaSelectionComponent } from './area-selection.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { SharedModule } from '@src/app/shared/shared.module';
import { HavCheckboxModule } from 'hav-components';
import { provideMockStore } from '@ngrx/store/testing';
import { SelectionLayoutComponent } from '../selection-layout/selection-layout.component';
import { AreaGroupComponent } from './area-group/area-group.component';

function setUp() {
  const fixture: ComponentFixture<AreaSelectionComponent> = TestBed.createComponent(AreaSelectionComponent);
  const component: AreaSelectionComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('AreaSelectionComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AreaSelectionComponent, SelectionLayoutComponent, AreaGroupComponent],
      imports: [SharedModule, HavCheckboxModule, TranslationSetupModule],
      providers: [provideMockStore()]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
