import { Component, OnInit, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { registerElement } from 'nativescript-angular/element-registry';
import { HttpService } from '../shared/services/http.service';
import { Scan } from '../shared/models/scan';
import { Notification } from '../shared/models/notification';
import { CardView } from 'nativescript-cardview';
registerElement('CardView', () => CardView);
import { Fab, } from '@nstudio/nativescript-floatingactionbutton';
import { BarcodeScanner } from 'nativescript-barcodescanner';
import { ToasterService } from '../shared/services/toaster.service';
registerElement('Fab', () => require('@nstudio/nativescript-floatingactionbutton').Fab);

@Component({
  selector: 'app-scans',
  templateUrl: './scans.component.html',
  styleUrls: ['./scans.component.css']
})
export class ScansComponent implements OnInit, AfterViewInit {

  actionBarTitle = 'SBB Rail Coffee ☕';
  loaded: boolean;
  items: Scan[];

  constructor(
    private _httpService: HttpService,
    private _codeScanner: BarcodeScanner,
    private _toasterService: ToasterService
    ) { }

  ngOnInit(): void {
    this._httpService.getScans().subscribe(
    scans => {
      this.items = scans;
      this.loaded = true;
    },
    err => {
      this._toasterService.showToast({ statusType: 'ERROR', detail: err } as Notification);
      console.log(err);
    }
    );
  }

  ngAfterViewInit() { }

  getTime(ms: number): Date {
    return new Date(ms);
  }

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
    }, (errMsg) => {
      this._toasterService.showToast({ statusType: 'ERROR', detail: errMsg } as Notification);
    });
  }

  private validateScan(message: string): boolean {
    const re = new RegExp('[A-Z]{3}\-([a-zA-Z0-9]{18})\-[a-fA-f0-9]{5}');
    return message && message.length === 28 && re.test(message);
  }


}
