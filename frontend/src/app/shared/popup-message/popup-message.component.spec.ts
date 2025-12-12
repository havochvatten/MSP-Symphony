import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideMockStore } from '@ngrx/store/testing';
import { PopupMessageComponent } from './popup-message.component';
import { StoreModule } from "@ngrx/store";
import { provideZonelessChangeDetection } from "@angular/core";

describe('PopupMessageComponent', () => {
  let fixture: ComponentFixture<PopupMessageComponent>,
      component: PopupMessageComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}, {})],
      declarations: [ PopupMessageComponent ],
      providers: [
        provideMockStore({
          initialState: {
            message : { popup: [] }
          }
        }),
        provideZonelessChangeDetection()
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(PopupMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
