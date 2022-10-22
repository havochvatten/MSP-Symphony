import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ToolbarButtonComponent } from './toolbar-button.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

function setUp() {
  const fixture: ComponentFixture<ToolbarButtonComponent> = TestBed.createComponent(ToolbarButtonComponent);
  const component: ToolbarButtonComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('ToolbarButtonComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslationSetupModule
      ],
      declarations: [ToolbarButtonComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
