import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferChangesComponent } from './transfer-changes.component';

describe('TransferChangesComponent', () => {
  let component: TransferChangesComponent;
  let fixture: ComponentFixture<TransferChangesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferChangesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferChangesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
