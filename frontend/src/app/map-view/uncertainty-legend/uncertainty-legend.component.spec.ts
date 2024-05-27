import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UncertaintyLegendComponent } from './uncertainty-legend.component';
import { provideMockStore } from "@ngrx/store/testing";
import { TranslateModule, TranslateService } from "@ngx-translate/core";

describe('UncertaintyLegendComponent', () => {
  let component: UncertaintyLegendComponent;
  let fixture: ComponentFixture<UncertaintyLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        TranslateService,
        provideMockStore({
          initialState : { user: {} }
        })],
      declarations: [UncertaintyLegendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UncertaintyLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
