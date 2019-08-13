import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../config';
import { Scan } from '../models/scan';
import { User} from '../models/user';
import { Cup } from '../models/cup';
import { ScanStatus } from '../models/scan-status';

@Injectable({ providedIn: 'root' })
export class HttpService {

  private _api = config.api;

  constructor(
    private _http: HttpClient,
  ) { }

  getCup(id: number): Observable<Cup> {
    return this._http.get<Cup>(`${this._api}cup/${id}`);
  }

  getCups(): Observable<Cup[]> {
    return this._http.get<Cup[]>(`${this._api}cup`);
  }

  getScan(id: number): Observable<Scan> {
    return this._http.get<Scan>(`${this._api}scan/${id}`);
  }

  /**
   * TODO: property des scan objekts anpassen, dass der status auf dem Server berechnet wird
   * Der Status muss im Model angepasst werden und serverseitig ein neues Objekt erstellt werden,
   * mit Spread die properties ergänzen
   * * Get scans per user
   * * Remove the getter for all scans later
   */
  getScans(code?: string): Observable<Scan[]> {
    return this._http.get<Scan[]>(`${this._api}scan`);
  }

  addScan(code: string): Observable<ScanStatus> {
    const params = new HttpParams().set('code', code);
    return this._http.get<ScanStatus>(`${this._api}scan/bycode`, { params: params });
  }


  // Updates existing scans if existing or create new ones.
  // setScan(cupId: number, userId: number): Observable<string> {
  //   const scan = <Scan>{
  //     rewarded: false,
  //     rewardedAt: undefined,
  //     cleaned: false,
  //     cleanedAt: undefined,
  //     cup_id: cupId,
  //     user_id: userId
  //   };
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'application/json',
  //     })
  //   };
  //   return this._http.post<string>(`${this._api}scan`, scan, httpOptions);
  // }


}

