import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { TranslateSpecModule } from '@src/testing/translate-spec.module';
import { provideZonelessChangeDetection, signal } from '@angular/core';

import { MultiActionButtonComponent } from './multi-action-button.component';
import { SharedModule } from '@shared/shared.module';

describe('MultiActionButtonComponent', () => {
  let component: MultiActionButtonComponent;
  let fixture: ComponentFixture<MultiActionButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, TranslateSpecModule],
      providers: [provideZonelessChangeDetection(), TranslateService],
      declarations: [MultiActionButtonComponent]
    });
    fixture = TestBed.createComponent(MultiActionButtonComponent);
    component = fixture.componentInstance;
    component.multiActionIcon = 'cross';
    component.disabledPredicate = () => false;
    component.isMultiMode = signal(false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
