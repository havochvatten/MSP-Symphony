import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { DialogRef } from '@src/app/shared/dialog/dialog-ref';
import { DialogConfig } from '@src/app/shared/dialog/dialog-config';

import { RenameUserAreaModalComponent } from './rename-user-area-modal.component';
import { HavButtonModule } from 'hav-components';

function setUp() {
  const fixture: ComponentFixture<RenameUserAreaModalComponent> = TestBed.createComponent(
    RenameUserAreaModalComponent
  );
  const component: RenameUserAreaModalComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('RenameUserAreaModalComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RenameUserAreaModalComponent],
      imports: [TranslationSetupModule, HavButtonModule],
      providers: [
        {
          provide: DialogRef,
          useValue: {}
        },
        {
          provide: DialogConfig,
          useValue: {
            data: {
              areaName: ''
            }
          }
        }
      ]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } =setUp();
    expect(component).toBeTruthy();
  });
});
