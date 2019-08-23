import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { registerElement } from 'nativescript-angular/element-registry';
import { CardView } from 'nativescript-cardview';
registerElement('CardView', () => CardView);
import { Fab, } from '@nstudio/nativescript-floatingactionbutton';
registerElement('Fab', () => require('@nstudio/nativescript-floatingactionbutton').Fab);
import { ObservableArray } from 'tns-core-modules/data/observable-array';

import { HttpService } from '../shared/services/http.service';
import { ToasterService } from '../shared/services/toaster.service';
import { BarcodeScanner } from 'nativescript-barcodescanner';

import { Scan, StatusType } from '../shared/models/scan';
import { Notification } from '../shared/models/notification';
import { Cup } from '../shared/models/cup';
import { TestScan } from './test-scan';

import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { has, findIndex } from 'lodash';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-scans',
  templateUrl: './scans.component.html',
  styleUrls: ['./scans.component.css']
})
export class ScansComponent implements OnInit, AfterViewInit, OnDestroy {

  actionBarTitle = 'SBB Rail Coffee ☕';
  private _loaded: boolean;
  private _scans: ObservableArray<Scan>;
  defaultItems = [{
    message: 'Keine Scans vorhanden...',
    action: 'Drücke den Scan-Button um den QR-Code eines Bechers zu scannen!'
  }];

  private _throttle = false;
  private _throttleTime = 2000;

  private _dataSource = interval(1500);

  private _userId = 2; // FIXME userId testing only

  private _scanOptions = {
    formats: 'QR_CODE',
    cancelLabel: 'Schliessen', // iOS only
    cancelLabelBackgroundColor: '#999999', // iOS only
    message: 'Use the volume buttons for extra light', // Android only
    showFlipCameraButton: false,
    preferFrontCamera: false,
    showTorchButton: true,
    beepOnScan: false,
    resultDisplayDuration: 0, // Android only, default 1500 (ms)
    openSettingsIfPermissionWasPreviouslyDenied: true // iOS only, send user to settings app if access previously denied
  };


  constructor(
    private _httpService: HttpService,
    private _codeScanner: BarcodeScanner,
    private _toasterService: ToasterService,
    private _changeDetectionRef: ChangeDetectorRef
    ) { }

  // ANCHOR *** Angular Lifecycle Methods ***

  ngOnInit(): void {
    this._changeDetectionRef.detectChanges();
    this.loadData();
  }

  ngAfterViewInit(): void { }

  ngOnDestroy(): void { }

  // ANCHOR *** User Interaction Methods ***

  // TODO Lock button for short time
  onNewScanTap(args): void {
    if (!this._throttle) { // TODO Replace with rxjs that calls next on btn click
      this._throttle = true;
      this._codeScanner.scan(this._scanOptions).then((result) => {
        if (result.format === 'QR_CODE' && result.text.length) {
          if (this.validateScan(result.text)) {

            this._httpService.addScan(result.text, this._userId).subscribe(
              (scan: Scan[]) => {
                // TODO Check received scans for errors?
                if (scan && scan.length) {
                  this.adjustScanList(scan[0]);
                } else {
                  this._toasterService.showToast({ statusType: 'ERROR', detail: 'Keine Antwort erhalten' } as Notification);
                }
              },
              err => this._toasterService.showToast({ statusType: 'ERROR', detail: err.message } as Notification)
            );


          } else {
            this._toasterService.showToast({
              statusType: 'ERROR',
              detail: 'Der gescannte Code ist kein Rail-Coffee Code!'
            } as Notification);
          }
        } else {
          this._toasterService.showToast({
            statusType: 'ERROR',
            detail: 'Scan wurde nicht erkannt'
          } as Notification);
        }
      }, errMsg => {
        this._toasterService.showToast({ statusType: 'ERROR', detail: errMsg } as Notification);
      });
    }
    setTimeout(() => this._throttle = false, this._throttleTime);
  }

  onScanTap(args): void {
    console.log('|===> TAP');
    alert('User tapped');
  }

  // onPullToRefreshInit(args: ListViewEventData) {
  onPullToRefreshInit(args) {
    const that = new WeakRef(this);
    setTimeout( () => {
      this.loadData();
      const listView = args.object;
      listView.notifyPullToRefreshFinished();
    }, 1000);
  }

  // ANCHOR *** Accessor Methods ***

  loadData(): void {
    this._httpService.getScans(this._userId).subscribe(
      (scans: Scan[]) => {
        console.log('|===> CONNECTED TO BACKEND');
        this._scans = new ObservableArray(scans);
        this._loaded = true;
        // this._scans = new ObservableArray([]); // FIXME testing only
      },
      err => {
        this._toasterService.showToast({ statusType: 'ERROR', detail: err } as Notification);
        console.log('|===> ERROR WHILE CONNECTING TO BACKEND', err);
      }
      );
      this._loaded = true;
      this._dataSource.pipe(take(5)).subscribe(val => this._scans.unshift(new TestScan(val, StatusType.reserved))); // FIXME testing only
  }

  getStatusClass(scan: Scan): string {
    if (scan.verified) {
      return scan.rewarded ? 'status-rewarded' : 'status-';
    } else {
      return scan.status === StatusType.reserved ? 'status-reserved' : 'status-overbid';
    }
  }

  getStatusDescription(scan: Scan): string {
    if (scan.verified) {
      return scan.rewarded ? 'Ausbezahlt' : 'Gutgeschrieben';
    } else {
      return scan.status === StatusType.reserved ? 'Reserviert' : 'Überboten';
    }
  }

  getCupId(scan: Scan): number | Cup {
    return has(scan, 'cup_round_id.cup_id') ? scan.cup_round_id.cup_id : 0;
  }

  getScannedTime(scan: Scan): string {
    return scan.updatedAt ? dayjs(scan.updatedAt).format('D.M.YY – HH:mm:ss') : 'Unbekannt';
  }

  get scanCount(): number {
    return this._scans ? this._scans.length : undefined;
  }

  get loaded(): boolean {
    return this._loaded;
  }

  get scans(): ObservableArray<Scan> {
    return this._scans;
  }

  // ANCHOR *** Private Methods ***

  private validateScan(message: string): boolean {
    const re = new RegExp('[A-Z]{3}\-([a-zA-Z0-9]{14,18})\-[a-fA-f0-9]{5}');
    return message && message.length >= 20 && message.length <= 28 && re.test(message);
  }

  private adjustScanList(scan: Scan): void {
    // Get array index if scan already exists and remove it.
    console.log('|===> filter for ob: ', scan);
    console.log('|===> found: ', this._scans.filter(e => e.id === scan.id));
    const existing = this._scans.filter(e => e.id === scan.id);
    if (existing && existing.length) {
      const idx = this._scans.indexOf(existing[0]);
      this.scans.splice(idx, 1);
    }
    // Add the new scan.
    this._scans.push(scan);
    this._toasterService.showToast({
      statusType: 'SUCCESS',
      detail: 'Becher erfolgreich reserviert'
    } as Notification);
  }

  /**
   * NOTE Fragen an Osci
   * * Vorschlag um die vielen Toasts im code zu vermeiden?
   * * nativeElement Zugriff auf registrierte Elemente wie CardView oder FAB
   * * Wann soll ich input des Backends testen? E.g. if (scan && scan.length) { ...
   */


}
