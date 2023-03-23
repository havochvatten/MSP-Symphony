import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { provideMockStore } from '@ngrx/store/testing';
import { PopupMessageComponent } from './popup-message.component';
import { StoreModule } from "@ngrx/store";

describe('PopupMessageComponent', () => {
  let fixture: ComponentFixture<PopupMessageComponent>,
      component: PopupMessageComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}, {})],
      declarations: [ PopupMessageComponent ],
      providers: [provideMockStore({
        initialState: {
          message : { popup: [] }
        }
      })]
    })
    .compileComponents();
    fixture = TestBed.createComponent(PopupMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
