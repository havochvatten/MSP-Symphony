import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UploadUserAreaModalComponent } from './upload-user-area-modal.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { DialogRef } from '@shared/dialog/dialog-ref';
import { DialogConfig } from '@shared/dialog/dialog-config';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

describe('UploadUserAreaModalComponent', () => {
  let fixture: ComponentFixture<UploadUserAreaModalComponent>;
  let component: UploadUserAreaModalComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UploadUserAreaModalComponent],
      imports: [
        TranslationSetupModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        MatProgressSpinnerModule
      ],
      providers: [
        { provide: DialogRef, useValue: { close: () => {} } },
        { provide: DialogConfig, useValue: { data: { mimeType: 'application/geopackage+sqlite3' } } },
        provideMockStore({ initialState: { user: {} } })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadUserAreaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty categories', () => {
    expect(component.categories).toBeDefined();
  });

  it('should set isCreatingNew to true when __new__ is selected', () => {
    component.categoryForm.get('categoryId')!.setValue('__new__');
    expect(component.isCreatingNew).toBeTrue();
  });

  it('should set isCreatingNew to false when existing category is selected', () => {
    component.categoryForm.get('categoryId')!.setValue('1');
    expect(component.isCreatingNew).toBeFalse();
  });

  it('should set uploadedArea when file is selected', () => {
    expect(component.uploadedArea).toBeUndefined();
  });

  it('should not confirm import when no file is uploaded', () => {
    const closeSpy = spyOn(TestBed.inject(DialogRef), 'close');
    component.uploadedArea = undefined;
    component.confirmImport();
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('should initialize customAreaName as empty string', () => {
    expect(component.customAreaName).toBe('');
  });

  it('cancel should close dialog', () => {
    const closeSpy = spyOn(TestBed.inject(DialogRef), 'close');
    component.cancel();
    expect(closeSpy).toHaveBeenCalled();
  });
});
