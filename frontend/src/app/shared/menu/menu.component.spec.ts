import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MenuComponent } from './menu.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

function setUp() {
  const fixture: ComponentFixture<MenuComponent> = TestBed.createComponent(MenuComponent);
  const component: MenuComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('MenuComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FontAwesomeModule,
        TranslationSetupModule
      ],
      declarations: [MenuComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
