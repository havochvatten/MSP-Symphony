import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IconButtonComponent } from './icon-button.component';
import { HavCoreModule } from 'hav-components';
import { IconComponent } from '../icon/icon.component';

function setUp() {
  const fixture: ComponentFixture<IconButtonComponent> = TestBed.createComponent(IconButtonComponent);
  const component: IconButtonComponent = fixture.componentInstance;
  component.label = 'test label';
  component.icon = 'plus';
  return { component, fixture };
}

describe('IconButtonComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HavCoreModule],
      declarations: [IconButtonComponent, IconComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
