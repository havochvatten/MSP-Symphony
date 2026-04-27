import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { UserActions, UserSelectors } from '@data/user';
import { environment } from '@src/environments/environment.prod';
import { State } from '@src/app/app-reducer';
import { BrandingService } from '@src/app/core/branding/branding.service';
import buildInfo from '@src/build-info';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject<Store<State>>(Store);
  public brandingService = inject(BrandingService);

  loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    standalone: false
  });
  errorMessage?: string;
  loading?: Observable<boolean>;
  env = environment;
  symphonyVersion = buildInfo.version;
  passwordPeekEnabled: boolean;
  peekPassword = false;

  private storeSubscription?: Subscription;

  constructor() {
    this.passwordPeekEnabled = this.env.peekPassword || false;
  }

  ngOnInit() {
    this.storeSubscription = this.store
      .select(UserSelectors.selectLoginError)
      .subscribe((value) => {
        if (value) {
          this.errorMessage =
            value.status === 401
              ? 'login.error.invalid-credentials'
              : 'login.error.system-unavailable';
        }
      });

    // Only shows the spinner, no navigation here
    this.loading = this.store
      .select(UserSelectors.selectIsInitialLoading)
      .pipe(debounceTime(0), distinctUntilChanged());
  }

  ngOnDestroy() {
    if (this.storeSubscription) {
      this.storeSubscription.unsubscribe();
    }
  }

  login() {
    if (this.loginForm.valid && this.loginForm.value.username && this.loginForm.value.password) {
      this.store.dispatch(
        UserActions.loginUser({
          username: this.loginForm.value.username,
          password: this.loginForm.value.password
        })
      );
    }
  }
}
