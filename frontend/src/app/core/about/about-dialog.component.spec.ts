import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AboutDialogComponent } from './about-dialog.component';
import { DialogRef } from "@shared/dialog/dialog-ref";
import { TranslationSetupModule } from "@src/app/app-translation-setup.module";
import { provideMockStore } from "@ngrx/store/testing";

class MockDialogRef {
  close = () => {}
}

describe('AboutDialogComponentComponent', () => {
  let component: AboutDialogComponent;
  let fixture: ComponentFixture<AboutDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslationSetupModule],
      declarations: [ AboutDialogComponent ],
      providers: [
        { provide: DialogRef, useClass: MockDialogRef },
        provideMockStore({
          initialState : { user: {} }
        })
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
