import { Injectable, NgZone } from '@angular/core';
import { connectionType } from 'tns-core-modules/connectivity/connectivity';
import { BehaviorSubject, Observable } from 'rxjs';
import * as connectivity from 'tns-core-modules/connectivity';



@Injectable({
  providedIn: 'root'
})
export class ConnectivityMonitorService {
  private _monitoringSubject = new BehaviorSubject<connectionType>(connectivity.getConnectionType());

  constructor(private _ngZone: NgZone) {
    connectivity.startMonitoring((newConnectionType: number) => {
      this._ngZone.run(() => {
        this._monitoringSubject.next(newConnectionType);
      });
    });
  }

  getMonitoringState(): Observable<connectionType> {
    return this._monitoringSubject.asObservable();
  }
}
