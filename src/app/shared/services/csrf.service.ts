import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, pipe } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '~/environments/environment';

@Injectable({ providedIn: 'root' })
export class CsrfService {

  private csrf: string;

  constructor(private http: HttpClient) { }

  requestCSRFToken(): Observable<string> {
    return this.http.get<any>(`${environment.api}csrf-token`)
      .pipe(map((res) => {
        this.csrf = res._csrf;
        return res._csrf;
      }));
  }

  getCSRFToken(): Observable<string> {
    if (this.csrf) {
      return of(this.csrf);
    }
    return this.requestCSRFToken();
  }

}
