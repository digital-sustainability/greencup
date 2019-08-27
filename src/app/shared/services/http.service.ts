import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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


  getScans(userId: number): Observable<Scan[]> {
    return this._http.get<Scan[]>(`${this._api}scan?user_id=${userId}`);
  }

  // Updates existing scans if existing or create new ones.
  addScan(code: string, userId: number): Observable<Scan> {
    const scanDetails = {
      code: code,
      user_id: userId
    };
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', })
    };
    return this._http.post<Scan>(`${this._api}scan`, scanDetails, httpOptions);
  }


}

