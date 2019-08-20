import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { registerElement } from 'nativescript-angular/element-registry';
import { HttpService } from '../shared/services/http.service';
import { Scan, StatusType } from '../shared/models/scan';
import { Cup } from '../shared/models/cup';
import { Notification } from '../shared/models/notification';
import { CardView } from 'nativescript-cardview';
registerElement('CardView', () => CardView);
import { Fab, } from '@nstudio/nativescript-floatingactionbutton';
registerElement('Fab', () => require('@nstudio/nativescript-floatingactionbutton').Fab);
import { BarcodeScanner } from 'nativescript-barcodescanner';
import { ToasterService } from '../shared/services/toaster.service';
import * as dayjs from 'dayjs';
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { TestScan } from './test-scan';
import { ObservableArray } from 'tns-core-modules/data/observable-array';

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
    private _toasterService: ToasterService
    ) { }

  ngOnInit(): void {
    this._scans = new ObservableArray([]);
    this._httpService.getScans().subscribe(
    scans => {
      // this.scans = scans; // TODO: Map each to scans
      console.log('CONNECTED');
      // this.scans = []; // testing
    },
    err => {
      this._toasterService.showToast({ statusType: 'ERROR', detail: err } as Notification);
      console.log(err);
    }
    );
    this._loaded = true;
    this._dataSource.pipe(take(5)).subscribe(val => this._scans.unshift(new TestScan(val, StatusType.reserved))); // testing
  }

  ngAfterViewInit(): void { }

  ngOnDestroy(): void { }

  getTime(ms: number): String {
    return dayjs(ms).format('D.M.YY – HH:mm:ss');
  }

  // TODO: Lock button for short time
  onNewScanTap(args): void {
    if (!this._throttle) { // TODO: Replace with rxjs that calls next on btn click
      this._throttle = true;
      this._codeScanner.scan(this._scanOptions).then((result) => {
        let message: Notification;
        if (result.format === 'QR_CODE' && result.text.length) {
          if (this.validateScan(result.text)) {
            message = { statusType: 'SUCCESS', detail: 'Code: ' + result.text } as Notification;
          } else {
            message = { statusType: 'ERROR', detail: 'Der gescannte Code ist kein Rail-Coffee Code!' } as Notification;
          }
        } else {
          message = { statusType: 'ERROR', detail: 'Scan wurde nicht erkannt' } as Notification;
        }
        this._toasterService.showToast(message);
      }, errMsg => {
        this._toasterService.showToast({ statusType: 'ERROR', detail: errMsg } as Notification);
      });
    }
    setTimeout(() => this._throttle = false, this._throttleTime);
  }

  onScanTap(args): void {
    console.log('TAP');
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

  get scanCount(): number {
    return this._scans ? this._scans.length : undefined;
  }

  get loaded(): boolean {
    return this._loaded;
  }

  get scans(): ObservableArray<Scan> {
    return this._scans;
  }

  private validateScan(message: string): boolean {
    const re = new RegExp('[A-Z]{3}\-([a-zA-Z0-9]{14,18})\-[a-fA-f0-9]{5}');
    return message && message.length >= 20 && message.length <= 28 && re.test(message);
  }


}
