import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteCalculationConfirmationDialogComponent } from './delete-calculation-confirmation-dialog.component';

describe('DeleteCalculationConfirmationDialogComponent', () => {
  let component: DeleteCalculationConfirmationDialogComponent;
  let fixture: ComponentFixture<DeleteCalculationConfirmationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteCalculationConfirmationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteCalculationConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
