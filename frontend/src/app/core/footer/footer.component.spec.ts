import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';
import { TranslateService } from '@ngx-translate/core';
import { TranslateSpecModule } from '@src/testing/translate-spec.module';
import { provideZonelessChangeDetection } from '@angular/core';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>, component: FooterComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateSpecModule],
      providers: [TranslateService, provideZonelessChangeDetection()],
      declarations: [FooterComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
