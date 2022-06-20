import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpactTableComponent } from './impact-table.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

function setUp() {
  const fixture: ComponentFixture<ImpactTableComponent> = TestBed.createComponent(
    ImpactTableComponent
  );
  const component: ImpactTableComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('ImpactTableComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImpactTableComponent],
      imports: [TranslationSetupModule]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
