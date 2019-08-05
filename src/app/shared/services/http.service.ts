import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HttpService {

  // TODO: add /api route
  private _api = 'https://rail-coffee.fdn-dev.iwi.unibe.ch/';

  constructor(
    private _http: HttpClient,
  ) { }

  getCup(id: number): Observable<Event> {
    return this._http.get<Event>(`${this._api}cup/${id}`);
  }

  
}

