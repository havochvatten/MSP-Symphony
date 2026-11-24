import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReliabilityLegendComponent } from './reliability-legend.component';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateService } from '@ngx-translate/core';
import { TranslateSpecModule } from '@src/testing/translate-spec.module';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ReliabilityLegendComponent', () => {
  let component: ReliabilityLegendComponent;
  let fixture: ComponentFixture<ReliabilityLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateSpecModule],
      providers: [
        TranslateService,
        provideMockStore({
          initialState: { user: {} }
        }),
        provideZonelessChangeDetection()
      ],
      declarations: [ReliabilityLegendComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ReliabilityLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
