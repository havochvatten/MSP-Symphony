import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReliabilityLegendComponent } from './reliability-legend.component';
import { provideMockStore } from "@ngrx/store/testing";
import { TranslateModule, TranslateService } from "@ngx-translate/core";

describe('ReliabilityLegendComponent', () => {
  let component: ReliabilityLegendComponent;
  let fixture: ComponentFixture<ReliabilityLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        TranslateService,
        provideMockStore({
          initialState : { user: {} }
        })],
      declarations: [ReliabilityLegendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReliabilityLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
