import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { RegisteringUser } from '../models/registering-user';
import { config } from '../config';
import { Observable, pipe, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { SecureStorage } from 'nativescript-secure-storage';


@Injectable({ providedIn: 'root' })
export class AuthService {

  private _authenticatedUser: User;
  private _store: string;
  private _api = config.api;
  private _secureStorage: SecureStorage;

  constructor(
    private _http: HttpClient
    ) {
      this._secureStorage = new SecureStorage();
    }

  createNewToken(loginDetails: { email: string, password: string }): Observable<{token: string}> {
    return this._http.post<{token: string}>(this._api + 'token-auth/create-token', loginDetails)
      .pipe(map((tokenObj) => {
       this._store = tokenObj.token;
        return tokenObj;
      }));
  }

  tokenLogin(loginDetails: { email: string, token: string }): Observable<User> {
    return this._http.post<User>(this._api + 'token-auth/login', loginDetails)
    .pipe(map((user) => {
      this._authenticatedUser = user;
       return user;
     }));
  }

  logout(): Observable<any> {
    return this._http.post<any>(this._api + 'logout', {})
    .pipe(map(() => {
      this.deleteStorageItem('usertoken');
      this._authenticatedUser = null;
      return null;
    }));
  }

  register(user: RegisteringUser): Observable<RegisteringUser> {
    return this._http.post<RegisteringUser>(this._api + 'user', user);
  }

  setStorageItem(key: string, value: string): string {
    const success = this._secureStorage.setSync({
      key: key,
      value: value
    });
    return success ? value : null;
  }

  getStorageItem(key: string): string {
    return this._secureStorage.getSync({ key: key });
  }

  deleteStorageItem(key: string): boolean {
    return this._secureStorage.removeSync({ key: key });
  }

  getAuthenticatedUser() {
    return this._authenticatedUser;
  }

  confirmEmail(userId: number, token: string) {
    return this._http.post<any>(this._api + 'register/confirm', {
      user_id: userId,
      token
    });
  }

  requestNewPassword(email: string) {
    return this._http.post<any>(this._api + 'token-auth/request-new-password', {
      email
    });
  }

  passwordReset(user_id: number, token: string, password: string, password_confirm: string) {
    return this._http.post<any>(this._api + 'token-auth/password-reset', {
      user_id,
      token,
      password,
      password_confirm
    });
  }

  passwordChange(old_password: string, password: string, confirm_password: string) {
    console.log('|==> I am sending: ', old_password, password, confirm_password);
    return this._http.post<any>(this._api + 'token-auth/password-change', {
      old_password,
      password,
      confirm_password
    });
  }

}
