import { Component, OnInit, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { registerElement } from 'nativescript-angular/element-registry';
import { HttpService } from '../shared/services/http.service';
import { Scan, StatusType } from '../shared/models/scan';
import { Cup } from '../shared/models/cup';
import { Notification } from '../shared/models/notification';
import { CardView } from 'nativescript-cardview';
registerElement('CardView', () => CardView);
import { Fab, } from '@nstudio/nativescript-floatingactionbutton';
import { BarcodeScanner } from 'nativescript-barcodescanner';
import { ToasterService } from '../shared/services/toaster.service';
registerElement('Fab', () => require('@nstudio/nativescript-floatingactionbutton').Fab);
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-scans',
  templateUrl: './scans.component.html',
  styleUrls: ['./scans.component.css']
})
export class ScansComponent implements OnInit, AfterViewInit {

  actionBarTitle = 'SBB Rail Coffee ☕';
  loaded: boolean;
  scans: Scan[];
  defaultItems = [{
    message: 'Keine Scans vorhanden...',
    action: 'Drücke den Scan-Button um den QR-Code eines Bechers zu scannen!'
  }];

  // TODO: Create objects as observable stream for testing
  testItems: Scan[] = [{
    createdAt: Date.now(),
    updatedAt: Date.now(),
    verifiedAt: undefined,
    verified: false,
    rewardedAt: undefined,
    rewarded: false,
    user_id: undefined,
    status: <StatusType>'reserved',
    cup_id: <Cup>{
      id: 1,
      batch_version: 1,
      code: 'SBB-1xxw4jzcan2n412345-e5885',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      scans: []
    },
    cup_round: {
      id: 1,
      special_event: '-',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cup_id: 1
    }
  }];

  constructor(
    private _httpService: HttpService,
    private _codeScanner: BarcodeScanner,
    private _toasterService: ToasterService
    ) { }

  ngOnInit(): void {
    this._httpService.getScans().subscribe(
    scans => {
      // this.scans = scans;
      this.scans = this.testItems; // testing
      // this.scans = []; // testing
      this.loaded = true;
    },
    err => {
      this._toasterService.showToast({ statusType: 'ERROR', detail: err } as Notification);
      console.log(err);
    }
    );
  }

  ngAfterViewInit() { }

  getTime(ms: number): String {
    return dayjs(ms).format('D.M.YY – HH:mm:ss');
  }

  // TODO: Lock button for short time
  onNewScanTap(args): void {
    this._codeScanner.scan({
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
    }).then((result) => {

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

  onCradTap(args): void {
    console.log('TAP');
  }

  getStatusClass(scan: Scan): string {
    if (scan.verified) {
      return scan.rewarded ? 'status-rewarded' : 'status-';
    } else {
      return scan.scanStatus === StatusType.reserved ? 'status-reserved' : 'status-overbid';
    }
  }

  getStatusDescription(scan: Scan): string {
    if (scan.verified) {
      return scan.rewarded ? 'Ausbezahlt' : 'Gutgeschrieben';
    } else {
      return scan.scanStatus === StatusType.reserved ? 'Reserviert' : 'Überboten';
    }
  }

  private validateScan(message: string): boolean {
    const re = new RegExp('[A-Z]{3}\-([a-zA-Z0-9]{14,18})\-[a-fA-f0-9]{5}');
    return message && message.length >= 20 && message.length <= 28 && re.test(message);
  }


}
