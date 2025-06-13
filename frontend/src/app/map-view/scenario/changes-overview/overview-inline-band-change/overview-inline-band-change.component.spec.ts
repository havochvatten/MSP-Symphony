import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewInlineBandChangeComponent } from './overview-inline-band-change.component';
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@data/metadata/metadata.reducers";
import { TranslationSetupModule } from "@src/app/app-translation-setup.module";
import { SharedModule } from "@shared/shared.module";

describe('OverviewInlineBandChangeComponent', () => {
  let component: OverviewInlineBandChangeComponent;
  let fixture: ComponentFixture<OverviewInlineBandChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslationSetupModule, SharedModule],
      declarations: [ OverviewInlineBandChangeComponent ],
      providers: [provideMockStore({ initialState: {
          metadata: initialState,
          user: {}
        }})]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverviewInlineBandChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
