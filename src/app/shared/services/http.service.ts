import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Scan } from '../models/scan';
import { User} from '../models/user';
import { Cup } from '../models/cup';
import { CupRound } from '../models/cup-round';
import { environment } from '~/environments/environment';

@Injectable({ providedIn: 'root' })
export class HttpService {

  private _api = environment.api;

  constructor(
    private _http: HttpClient,
  ) { }


  getScans(userId: number): Observable<Scan[]> {
    return this._http.get<Scan[]>(`${this._api}scan?user_id=${userId}`);
  }

  getCupRounds(userId: number): Observable<CupRound[]> {
    return this._http.get<CupRound[]>(`${this._api}cupRound`, {
      params: {
        'complete': 'true',
        'closed_by': userId.toString(),
        sort: 'createdAt DESC'
      }
    });
  }

  // Updates existing scans if existing or create new ones.
  addScan(code: string): Observable<Scan> {
    const scanDetails = {
      code: code
    };
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', })
    };
    return this._http.post<Scan>(`${this._api}scan`, scanDetails, httpOptions);
  }

  // sends a close round request for the specified cup code
  closeRound(code: string): Observable<any> {
    const scanDetails = {
      code: code,
    };
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', })
    };
    return this._http.post(`${this._api}cup-round/close`, scanDetails, httpOptions);
  }

  // sends a payout request to set all verified scans of the user to rewarded
  payout(): Observable<any> {
    const scanDetails = {};
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json', })
    };
    return this._http.post(`${this._api}scan/payout`, scanDetails, httpOptions);
  }

}

