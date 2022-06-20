import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionLayoutComponent } from './selection-layout.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

function setUp() {
  const fixture: ComponentFixture<SelectionLayoutComponent> = TestBed.createComponent(SelectionLayoutComponent);
  const component: SelectionLayoutComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('SelectionLayoutComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SelectionLayoutComponent],
      imports: [SharedModule, TranslationSetupModule]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
