import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UploadFilesComponent } from './upload-files.component';
import { IconComponent } from '../icon/icon.component';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { DragDropDirective } from '../drag-drop.directive';

function setUp() {
  const fixture: ComponentFixture<UploadFilesComponent> = TestBed.createComponent(
    UploadFilesComponent
  );
  const component: UploadFilesComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('UploadFilesComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UploadFilesComponent, IconComponent, IconButtonComponent, DragDropDirective]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
