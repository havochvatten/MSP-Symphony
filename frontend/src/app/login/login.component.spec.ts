import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { LoginComponent } from './login.component';
import { HavFormFieldModule, HavButtonModule } from 'hav-components';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslationSetupModule } from '../app-translation-setup.module';

function setUp() {
  const fixture: ComponentFixture<LoginComponent> = TestBed.createComponent(LoginComponent);
  const component: LoginComponent = fixture.componentInstance;
  return { component, fixture };
}

describe('LoginComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        HavFormFieldModule,
        HavButtonModule,
        ReactiveFormsModule,
        TranslationSetupModule,
        RouterTestingModule
      ],
      declarations: [LoginComponent],
      providers: [provideMockStore()]
    }).compileComponents();
  }));

  it('should create', () => {
    const { component } = setUp();
    expect(component).toBeTruthy();
  });
});
