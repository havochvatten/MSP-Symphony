import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConfirmationDialogBoxComponent } from './confirmation-dialog-box.component';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { IconComponent } from '../icon/icon.component';

describe('ConfirmationDialogBoxComponent', () => {
  let fixture: ComponentFixture<ConfirmationDialogBoxComponent>,
      component: ConfirmationDialogBoxComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmationDialogBoxComponent, IconButtonComponent, IconComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ConfirmationDialogBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
