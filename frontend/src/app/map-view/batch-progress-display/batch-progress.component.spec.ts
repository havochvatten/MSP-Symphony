import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchProgressComponent } from './batch-progress.component';
import { StoreModule } from "@ngrx/store";
import { provideMockStore } from "@ngrx/store/testing";
import { TranslateModule } from "@ngx-translate/core";

describe('BatchProgressDisplayComponent', () => {
  let component: BatchProgressComponent;
  let fixture: ComponentFixture<BatchProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({},{}),
        TranslateModule.forRoot()
      ],
      providers: [
        provideMockStore({
          initialState: {}
        })
      ],
      declarations: [ BatchProgressComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatchProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
