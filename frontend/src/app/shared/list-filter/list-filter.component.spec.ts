import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFilterComponent } from './list-filter.component';
import { TranslationSetupModule } from "@src/app/app-translation-setup.module";
import { provideMockStore } from "@ngrx/store/testing";

describe('ListFilterComponent', () => {
  let component: ListFilterComponent;
  let fixture: ComponentFixture<ListFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[TranslationSetupModule],
      declarations: [ ListFilterComponent ],
      providers: [provideMockStore({ initialState : { user: {} } })]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
