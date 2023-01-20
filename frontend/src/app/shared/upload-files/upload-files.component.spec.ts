import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UploadFilesComponent } from './upload-files.component';
import { IconComponent } from '../icon/icon.component';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { DragDropDirective } from '../drag-drop.directive';

describe('UploadFilesComponent', () => {
  let fixture: ComponentFixture<UploadFilesComponent>,
      component: UploadFilesComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UploadFilesComponent, IconComponent, IconButtonComponent, DragDropDirective]
    }).compileComponents();
    fixture = TestBed.createComponent(UploadFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
