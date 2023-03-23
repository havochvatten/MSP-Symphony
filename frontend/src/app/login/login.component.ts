import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { State } from '@src/app/app-reducer';
import { UserActions, UserSelectors } from '@data/user';
import { Subscription, Observable } from 'rxjs';
import { environment } from "@src/environments/environment.prod";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });
  errorMessage?: string;
  loading?: Observable<boolean>;
  env = environment;
  private storeSubscription?: Subscription;

  constructor(private fb: FormBuilder, private store: Store<State>) {}

  ngOnInit() {
    this.storeSubscription = this.store.select(UserSelectors.selectLoginError).subscribe(value => {
      if (value) {
        this.errorMessage =
          value.status === 401
            ? 'login.error.invalid-credentials'
            : 'login.error.system-unavailable';
      }
    });
    this.loading = this.store.select(UserSelectors.selectIsLoading);
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
