import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

import { MultiToolsComponent } from './multi-tools.component';
import { signal } from "@angular/core";

describe('MultiToolsComponent', () => {
  let component: MultiToolsComponent;
  let fixture: ComponentFixture<MultiToolsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslationSetupModule],
      declarations: [MultiToolsComponent]
    });
    fixture = TestBed.createComponent(MultiToolsComponent);
    component = fixture.componentInstance;
    component.isMultiMode = signal(false);
    component.disabledPredicate = () => false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
