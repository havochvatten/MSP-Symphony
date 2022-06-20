import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@src/app/shared/shared.module';

import { AreaGroupComponent } from './area-group.component';

function setUp() {
  const fixture: ComponentFixture<AreaGroupComponent> = TestBed.createComponent(AreaGroupComponent);
  const component: AreaGroupComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('AreaGroupComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AreaGroupComponent],
      imports: [SharedModule]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
