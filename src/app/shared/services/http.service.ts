import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../config';
import { Scan } from '../models/scan';
import { User} from '../models/user';
import { Cup } from '../models/cup';

@Injectable({ providedIn: 'root' })
export class HttpService {

  private _api = config.api;

  constructor(
    private _http: HttpClient,
  ) { }

  getCup(id: number): Observable<Cup> {
    return this._http.get<Cup>(`${this._api}cup/${id}`);
  }

  // TODO: Get scans per cup and user
  getCups(): Observable<Cup[]> {
    return this._http.get<Cup[]>(`${this._api}cup`);
  }

  getScan(id: number): Observable<Scan> {
    return this._http.get<Scan>(`${this._api}scan/${id}`);
  }

  // TODO: Get scans per cup and user
  getScans(): Observable<Scan[]> {
    return this._http.get<Scan[]>(`${this._api}scan`);
  }

  setScan(cupId: number, userId: number): Observable<Scan> {
    const scan = <Scan>{
      rewarded: false,
      rewardedAt: undefined,
      cleaned: false,
      cleanedAt: undefined,
      cup_id: cupId,
      user_id: userId
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    return this._http.post<Scan>(`${this._api}scan`, scan, httpOptions);
  }

}

