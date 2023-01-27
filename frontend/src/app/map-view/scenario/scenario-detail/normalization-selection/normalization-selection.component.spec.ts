import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NormalizationSelectionComponent } from './normalization-selection.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';
import { OrdinalPipe } from "@shared/ordinal.pipe";
import { MatRadioModule } from "@angular/material/radio";
import { TranslateModule, TranslateService } from "@ngx-translate/core";

describe('NormalizationSelectionComponent', () => {
  let component: NormalizationSelectionComponent;
  let fixture: ComponentFixture<NormalizationSelectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslationSetupModule,
        MatRadioModule
      ],
      providers: [OrdinalPipe],
      declarations: [NormalizationSelectionComponent, OrdinalPipe]
    }).compileComponents();
    fixture = TestBed.createComponent(NormalizationSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
