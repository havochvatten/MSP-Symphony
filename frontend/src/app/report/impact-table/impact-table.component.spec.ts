import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ImpactTableComponent } from './impact-table.component';
import { TranslationSetupModule } from '@src/app/app-translation-setup.module';

describe('ImpactTableComponent', () => {
  let fixture: ComponentFixture<ImpactTableComponent>,
      component: ImpactTableComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ImpactTableComponent],
      imports: [TranslationSetupModule]
    }).compileComponents();
    fixture = TestBed.createComponent(ImpactTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
