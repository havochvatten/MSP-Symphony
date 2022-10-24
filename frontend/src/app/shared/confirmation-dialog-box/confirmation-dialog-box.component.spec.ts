import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConfirmationDialogBoxComponent } from './confirmation-dialog-box.component';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { HavButtonModule, HavCoreModule } from 'hav-components';
import { IconComponent } from '../icon/icon.component';

function setUp() {
  const fixture: ComponentFixture<ConfirmationDialogBoxComponent> = TestBed.createComponent(ConfirmationDialogBoxComponent);
  const component: ConfirmationDialogBoxComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('ConfirmationDialogBoxComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HavCoreModule, HavButtonModule],
      declarations: [ConfirmationDialogBoxComponent, IconButtonComponent, IconComponent]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
