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
  private _secureStorage: any; // TODO: Type

  constructor(
    private _http: HttpClient
    ) {
      this._secureStorage = new SecureStorage();
    }

  login(loginDetails: { email: string, password: string }): Observable<{token: string}> {
    return this._http.post<{token: string}>(this._api + 'token-auth/create-token', loginDetails)
      .pipe(map((tokenObj) => {
       this._store = tokenObj.token;
        return tokenObj;
      }));
  }

  update(user: Partial<User>): Observable<User> {
    return this._http.patch<User>(this._api + `api/user/${this._authenticatedUser.id}`, user)
    .pipe(map((user: User) => {
      this._authenticatedUser = user;
      return user;
    }));
  }

  findOne(id: number): Observable<User> {
    return this._http.get<User>(this._api + `user/\${id}`);
  }

  /**
   * Used to check if the user is logged in after a page refresh.
   * It automatically logs in the user and sets the authenticated user
   * if the server returns a positive response.
   */
  checkLogin(): Observable<boolean> {
    return this._http.get<User>(this._api + 'api/check-login')
      .pipe(map((user) => {
        this._authenticatedUser = user;
        return user ? true : false;
      }),
      catchError(e => of(false)
      ));
  }

  // TODO: Delete token
  logout(): Observable<any> {
    return this._http.post<any>(this._api + 'api/logout', {})
      .pipe(map(() => {
        this._authenticatedUser = null;
        return null;
      }));
  }

  getAuthenticatedUser(): User {
    return this._authenticatedUser;
  }

  // getAuthenticatedProjectId(): number {
  //   if (!this._authenticatedUser || this._authenticatedUser.projects.length === 0) {
  //     return -1;
  //   }
  //   return this._authenticatedUser.projects[0].id;
  // }

  // isProjectOwner(projectId: number): boolean {
  //  return this.getAuthenticatedProjectId() === projectId;
  // }

  isAuthenticated(): boolean {
    return this._authenticatedUser ? true : false;
  }

  register(user: RegisteringUser): Observable<RegisteringUser> {
    return this._http.post<RegisteringUser>(this._api + 'user', user);
  }

  confirm(userIdAndToken): Observable<any> {
    return this._http.post<any>(this._api + 'api/register/confirm', userIdAndToken);
  }

  setUserToken(key: string, token: string): string {
    const success = this._secureStorage.setSync({
      key: key,
      value: token
    });
    return success ? token : null;
  }

  getUserToken(key: string): string {
    return this._secureStorage.getSync({ key: key });
  }

  // TODO: Delete token on logout
  delteUserToken(key: string): boolean {
    return this._secureStorage.removeSync({ key: key });
  }
}
